import mongoose, { Document, Schema } from 'mongoose';
import { IBudget, BudgetPeriod, BudgetStatus } from '@/types';

const budgetSchema = new Schema<IBudget>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'food', 'transport', 'housing', 'utilities', 'entertainment',
      'healthcare', 'education', 'shopping', 'savings', 'debt_payment',
      'airtime', 'mpesa_fees', 'insurance', 'charity', 'travel', 'subscription'
    ],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: Date,
  alerts: {
    type: Boolean,
    default: true
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  rollover: {
    type: Boolean,
    default: false
  },
  rolloverAmount: {
    type: Number,
    default: 0
  },
  categories: [{
    type: String,
    enum: [
      'food', 'transport', 'housing', 'utilities', 'entertainment',
      'healthcare', 'education', 'shopping', 'savings', 'debt_payment',
      'airtime', 'mpesa_fees', 'insurance', 'charity', 'travel', 'subscription'
    ]
  }],
  notes: String,
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'expired'],
    default: 'active',
    index: true
  },
  alertsSent: [{
    id: { type: String, required: true },
    threshold: { type: Number, required: true },
    triggeredAt: { type: Date, default: Date.now },
    message: String,
    sentVia: [String],
    acknowledged: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes
budgetSchema.index({ userId: 1, status: 1 });
budgetSchema.index({ userId: 1, category: 1 });
budgetSchema.index({ period: 1 });
budgetSchema.index({ startDate: 1, endDate: 1 });

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  return (this.spent / this.amount) * 100;
});

// Virtual for over budget
budgetSchema.virtual('isOverBudget').get(function() {
  return this.spent > this.amount;
});

// Virtual for days remaining in period
budgetSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) {
    const now = new Date();
    if (this.period === 'monthly') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 3600 * 24));
    } else if (this.period === 'weekly') {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      return Math.ceil((endOfWeek.getTime() - now.getTime()) / (1000 * 3600 * 24));
    }
    return 0;
  }
  return Math.ceil((this.endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
});

// Method to check if alert should be sent
budgetSchema.methods.shouldSendAlert = function(): boolean {
  if (!this.alerts) return false;
  
  const percentage = this.percentageUsed;
  const lastAlert = this.alertsSent[this.alertsSent.length - 1];
  
  // Don't send alert if we've already sent one at this threshold
  if (lastAlert && lastAlert.threshold === this.alertThreshold) {
    return false;
  }
  
  return percentage >= this.alertThreshold;
};

// Method to add spending
budgetSchema.methods.addSpending = async function(amount: number, transactionId?: string) {
  this.spent += amount;
  
  // Check if alert should be sent
  if (this.shouldSendAlert()) {
    this.alertsSent.push({
      id: new mongoose.Types.ObjectId().toString(),
      threshold: this.alertThreshold,
      message: `You've used ${this.percentageUsed.toFixed(1)}% of your ${this.name} budget`,
      sentVia: ['push', 'email']
    });
  }
  
  return this.save();
};

// Method to reset budget for new period
budgetSchema.methods.resetForNewPeriod = async function() {
  if (this.rollover) {
    this.rolloverAmount = this.remaining;
  }
  this.spent = 0;
  
  // Update dates based on period
  const now = new Date();
  if (this.period === 'monthly') {
    this.startDate = now;
    this.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (this.period === 'weekly') {
    this.startDate = now;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    this.endDate = endOfWeek;
  } else if (this.period === 'daily') {
    this.startDate = now;
    this.endDate = new Date(now);
    this.endDate.setHours(23, 59, 59, 999);
  }
  
  return this.save();
};

// Static method to get active budgets
budgetSchema.statics.getActiveBudgets = function(userId: string) {
  const now = new Date();
  return this.find({
    userId,
    status: 'active',
    $or: [
      { endDate: { $gte: now } },
      { endDate: null }
    ]
  });
};

// Static method to get budgets that need reset
budgetSchema.statics.getBudgetsNeedingReset = async function() {
  const now = new Date();
  return this.find({
    status: 'active',
    endDate: { $lt: now }
  });
};

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
