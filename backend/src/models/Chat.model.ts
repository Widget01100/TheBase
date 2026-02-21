import mongoose, { Document, Schema } from 'mongoose';
import { IChatMessage, IChatSession } from '@/types';

// Chat Session Schema
const chatSessionSchema = new Schema<IChatSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Conversation'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  messageCount: {
    type: Number,
    default: 0
  },
  topics: [String],
  summary: String,
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative']
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Chat Message Schema
const chatMessageSchema = new Schema<IChatMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  context: {
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    goal: { type: Schema.Types.ObjectId, ref: 'Goal' },
    budget: { type: Schema.Types.ObjectId, ref: 'Budget' },
    investment: { type: Schema.Types.ObjectId, ref: 'Investment' },
    challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
    userStats: Schema.Types.Mixed,
    timeRange: {
      start: Date,
      end: Date
    }
  },
  attachments: [{
    type: { type: String, enum: ['image', 'file', 'link'] },
    url: String,
    name: String,
    size: Number
  }],
  reactions: [String],
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
chatSessionSchema.index({ userId: 1, startedAt: -1 });
chatSessionSchema.index({ topics: 1 });

chatMessageSchema.index({ sessionId: 1, timestamp: 1 });
chatMessageSchema.index({ userId: 1, timestamp: -1 });
chatMessageSchema.index({ role: 1 });

// Pre-save middleware for chat session
chatSessionSchema.pre('save', function(next) {
  if (this.isNew) {
    const now = new Date();
    this.title = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }
  next();
});

// Method to end chat session
chatSessionSchema.methods.end = async function() {
  this.endedAt = new Date();
  
  // Generate summary from messages
  const messages = await mongoose.model('ChatMessage').find({ sessionId: this._id })
    .sort({ timestamp: 1 });
  
  if (messages.length > 0) {
    // Extract topics (simplified - in production use NLP)
    const topics = new Set();
    messages.forEach(msg => {
      if (msg.role === 'user') {
        const words = msg.content.toLowerCase().split(' ');
        words.forEach(word => {
          if (['save', 'invest', 'budget', 'goal', 'debt', 'retire', 'tax', 'mpesa'].includes(word)) {
            topics.add(word);
          }
        });
      }
    });
    this.topics = Array.from(topics);
    
    // Determine sentiment based on last message
    const lastMsg = messages[messages.length - 1];
    // Simplified sentiment - in production use actual sentiment analysis
    if (lastMsg.content.includes('thank') || lastMsg.content.includes('great')) {
      this.sentiment = 'positive';
    } else if (lastMsg.content.includes('help') || lastMsg.content.includes('?')) {
      this.sentiment = 'neutral';
    } else {
      this.sentiment = 'negative';
    }
  }
  
  return this.save();
};

// Method to add message to session
chatSessionSchema.methods.addMessage = async function(
  content: string,
  role: 'user' | 'assistant' | 'system',
  context?: any,
  attachments?: any[]
) {
  const message = await mongoose.model('ChatMessage').create({
    userId: this.userId,
    sessionId: this._id,
    content,
    role,
    context,
    attachments
  });
  
  this.messageCount += 1;
  await this.save();
  
  return message;
};

// Method to add feedback
chatSessionSchema.methods.addFeedback = async function(rating: number, comment?: string) {
  this.feedback = {
    rating,
    comment,
    timestamp: new Date()
  };
  return this.save();
};

// Static method to get user's recent sessions
chatSessionSchema.statics.getRecentForUser = function(userId: string, limit: number = 10) {
  return this.find({ userId })
    .sort({ startedAt: -1 })
    .limit(limit)
    .select('title startedAt messageCount sentiment');
};

// Static method to search messages
chatMessageSchema.statics.search = function(userId: string, query: string, limit: number = 20) {
  return this.find({
    userId,
    $text: { $search: query }
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('sessionId', 'title');
};

// Create text index for search
chatMessageSchema.index({ content: 'text' });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
