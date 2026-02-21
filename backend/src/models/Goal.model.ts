import mongoose, { Document, Schema } from 'mongoose';
import { IGoal, GoalCategory, GoalPriority, GoalStatus } from '@/types';

const goalSchema = new Schema<IGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['savings', 'investment', 'debt', 'purchase', 'emergency', 'retirement', 'education', 'travel', 'other'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  autoSave: {
    type: Boolean,
    default: false
  },
  autoSaveAmount: {
    type: Number,
    min: 0
  },
  autoSaveFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
  },
  autoSaveSource: String,
  notes: String,
  image: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedDate: Date,
  milestones: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    achieved: { type: Boolean, default: false },
    achievedDate: Date,
    reward: String
  }],
  contributions: [{
    id: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    note: String,
    type: { type: String, enum: ['manual', 'auto', 'roundup', 'bonus'], default: 'manual' }
  }],
  reminders: [{
    id: { type: String, required: true },
    date: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    type: { type: String, enum: ['weekly', 'monthly', 'custom'] },
    message: String
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled', 'overdue'],
    default: 'active',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  projectedCompletionDate: Date,
  isOnTrack: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, priority: -1 });
goalSchema.index({ deadline: 1 });
goalSchema.index({ completed: 1 });

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  return (this.currentAmount / this.targetAmount) * 100;
});

// Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const timeDiff = this.deadline.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for required monthly savings
goalSchema.virtual('requiredMonthly').get(function() {
  const monthsRemaining = this.daysRemaining / 30;
  return this.remainingAmount / monthsRemaining;
});

// Pre-save middleware to calculate progress and check on-track status
goalSchema.pre('save', function(next) {
  // Calculate progress
  this.progress = (this.currentAmount / this.targetAmount) * 100;
  
  // Check if completed
  if (this.currentAmount >= this.targetAmount && !this.completed) {
    this.completed = true;
    this.completedDate = new Date();
    this.status = 'completed';
  }
  
  // Check if overdue
  if (!this.completed && new Date() > this.deadline) {
    this.status = 'overdue';
  }
  
  // Calculate if on track
  if (!this.completed) {
    const now = new Date();
    const totalDays = (this.deadline.getTime() - this.createdAt.getTime()) / (1000 * 3600 * 24);
    const daysPassed = (now.getTime() - this.createdAt.getTime()) / (1000 * 3600 * 24);
    const expectedProgress = (daysPassed / totalDays) * 100;
    this.isOnTrack = this.progress >= expectedProgress;
    
    // Project completion date
    if (this.progress > 0) {
      const progressPerDay = this.progress / daysPassed;
      const daysToCompletion = (100 - this.progress) / progressPerDay;
      this.projectedCompletionDate = new Date(now.getTime() + daysToCompletion * 24 * 60 * 60 * 1000);
    }
  }
  
  next();
});

// Method to add contribution
goalSchema.methods.addContribution = async function(
  amount: number, 
  type: 'manual' | 'auto' | 'roundup' | 'bonus' = 'manual',
  transactionId?: string,
  note?: string
) {
  this.currentAmount += amount;
  this.contributions.push({
    id: new mongoose.Types.ObjectId().toString(),
    amount,
    date: new Date(),
    transactionId,
    note,
    type
  });
  
  // Check milestones
  for (const milestone of this.milestones) {
    if (!milestone.achieved && this.currentAmount >= milestone.targetAmount) {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
    }
  }
  
  return this.save();
};

// Method to check if milestone achieved
goalSchema.methods.checkMilestones = function() {
  const achievedMilestones = [];
  for (const milestone of this.milestones) {
    if (!milestone.achieved && this.currentAmount >= milestone.targetAmount) {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
      achievedMilestones.push(milestone);
    }
  }
  return achievedMilestones;
};

// Static method to get goals that need reminders
goalSchema.statics.getGoalsNeedingReminders = async function() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    status: 'active',
    'reminders.sent': false,
    $or: [
      { deadline: { $lte: tomorrow, $gte: now } },
      { 
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: '$deadline' }, { $dayOfMonth: now }] },
            { $eq: [{ $month: '$deadline' }, { $month: now }] }
          ]
        }
      }
    ]
  }).populate('userId', 'email firstName phoneNumber preferences');
};

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
