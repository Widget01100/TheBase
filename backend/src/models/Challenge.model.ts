import mongoose, { Document, Schema } from 'mongoose';
import { IChallenge, IUserChallenge, ChallengeType, ChallengeDifficulty, UserChallengeStatus } from '@/types';

// Main Challenge Schema
const challengeSchema = new Schema<IChallenge>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['saving', 'investment', 'budget', 'education', 'fitness', 'custom'],
    required: true,
    index: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  targetAmount: {
    type: Number,
    min: 0
  },
  targetAction: String,
  rules: [{
    id: { type: String, required: true },
    description: { type: String, required: true },
    requirement: { type: Number, required: true },
    reward: String,
    unit: String
  }],
  badge: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary', 'mythic'], default: 'common' },
    points: { type: Number, default: 100 },
    requirements: [String],
    unlockedBy: { type: Number, default: 0 }
  },
  participants: {
    type: Number,
    default: 0
  },
  completedCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// User Challenge Schema
const userChallengeSchema = new Schema<IUserChallenge>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeId: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  currentProgress: {
    type: Number,
    default: 0,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedDate: Date,
  earnedBadge: {
    id: String,
    name: String,
    description: String,
    icon: String,
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary', 'mythic'] },
    points: Number,
    requirements: [String],
    unlockedBy: Number
  },
  milestones: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    achieved: { type: Boolean, default: false },
    achievedDate: Date,
    progress: { type: Number, default: 0 },
    reward: String
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed', 'abandoned'],
    default: 'active',
    index: true
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for user challenges
userChallengeSchema.index({ userId: 1, status: 1 });
userChallengeSchema.index({ challengeId: 1, completed: 1 });
userChallengeSchema.index({ startDate: -1 });

// Pre-save middleware for challenge
challengeSchema.pre('save', function(next) {
  // Generate badge ID if not present
  if (!this.badge.id) {
    this.badge.id = new mongoose.Types.ObjectId().toString();
  }
  
  // Generate rule IDs if not present
  this.rules.forEach(rule => {
    if (!rule.id) {
      rule.id = new mongoose.Types.ObjectId().toString();
    }
  });
  
  next();
});

// Virtual for challenge completion rate
challengeSchema.virtual('completionRate').get(function() {
  if (this.participants === 0) return 0;
  return (this.completedCount / this.participants) * 100;
});

// Method to get challenge progress for user
challengeSchema.methods.getUserProgress = async function(userId: string) {
  const userChallenge = await mongoose.model('UserChallenge').findOne({
    userId,
    challengeId: this._id
  });
  
  if (!userChallenge) return null;
  
  return {
    progress: userChallenge.currentProgress,
    completed: userChallenge.completed,
    daysRemaining: this.duration - Math.floor((Date.now() - userChallenge.startDate.getTime()) / (1000 * 3600 * 24)),
    milestones: userChallenge.milestones
  };
};

// Static method to get featured challenges
challengeSchema.statics.getFeaturedChallenges = function(limit: number = 3) {
  return this.find({ featured: true, isActive: true })
    .sort({ completedCount: -1 })
    .limit(limit);
};

// Static method to get challenges by difficulty
challengeSchema.statics.getByDifficulty = function(difficulty: string, limit: number = 10) {
  return this.find({ difficulty, isActive: true })
    .sort({ participants: -1 })
    .limit(limit);
};

// Pre-save middleware for user challenge
userChallengeSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Initialize milestones from challenge
    const challenge = await mongoose.model('Challenge').findById(this.challengeId);
    if (challenge) {
      this.milestones = challenge.rules.map(rule => ({
        id: rule.id,
        name: rule.description,
        achieved: false,
        progress: 0,
        reward: rule.reward
      }));
    }
  }
  
  next();
});

// Method to update progress
userChallengeSchema.methods.updateProgress = async function(amount: number) {
  this.currentProgress += amount;
  
  // Check milestones
  for (const milestone of this.milestones) {
    if (!milestone.achieved && this.currentProgress >= milestone.progress + amount) {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
    }
  }
  
  // Check if challenge is completed
  const challenge = await mongoose.model('Challenge').findById(this.challengeId);
  if (challenge && this.currentProgress >= (challenge.targetAmount || 100)) {
    this.completed = true;
    this.completedDate = new Date();
    this.status = 'completed';
    this.earnedBadge = challenge.badge;
    
    // Update challenge stats
    await mongoose.model('Challenge').findByIdAndUpdate(this.challengeId, {
      $inc: { completedCount: 1 }
    });
    
    // Award user XP
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.userId, {
      $inc: { 
        'stats.experience': challenge.badge.points,
        'stats.completedChallenges': 1
      },
      $push: { 'stats.achievements': challenge.badge.id }
    });
  }
  
  return this.save();
};

// Method to pause challenge
userChallengeSchema.methods.pause = async function() {
  this.status = 'paused';
  return this.save();
};

// Method to resume challenge
userChallengeSchema.methods.resume = async function() {
  this.status = 'active';
  return this.save();
};

// Method to abandon challenge
userChallengeSchema.methods.abandon = async function() {
  this.status = 'abandoned';
  return this.save();
};

// Static method to get active challenges for user
userChallengeSchema.statics.getActiveForUser = function(userId: string) {
  return this.find({
    userId,
    status: 'active'
  }).populate('challengeId');
};

// Static method to check for expired challenges
userChallengeSchema.statics.checkExpired = async function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const expired = await this.find({
    status: 'active',
    updatedAt: { $lt: thirtyDaysAgo }
  });
  
  for (const challenge of expired) {
    challenge.status = 'failed';
    await challenge.save();
  }
  
  return expired;
};

export const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);
export const UserChallenge = mongoose.model<IUserChallenge>('UserChallenge', userChallengeSchema);
