import mongoose, { Document, Schema } from 'mongoose';
import { ITransaction, TransactionType, TransactionCategory, TransactionStatus } from '@/types';

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer', 'investment', 'saving', 'loan', 'refund', 'fee'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'salary', 'business', 'investment_income', 'gift', 'other_income',
      'food', 'transport', 'housing', 'utilities', 'entertainment',
      'healthcare', 'education', 'shopping', 'savings', 'debt_payment',
      'airtime', 'mpesa_fees', 'fuliza', 'sacco', 'mmf', 'stocks',
      'insurance', 'tax', 'charity', 'travel', 'subscription'
    ],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  mpesaCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  mpesaData: {
    transactionId: String,
    transactionDate: Date,
    transactionTime: String,
    fullNames: String,
    phoneNumber: String,
    amount: Number,
    accountNumber: String,
    commandId: String,
    receiptNumber: String,
    balance: Number,
    rawMessage: String,
    businessShortCode: String,
    thirdPartyId: String
  },
  receipt: {
    url: String,
    uploadedAt: Date,
    parsedData: Schema.Types.Mixed,
    ocrText: String,
    merchant: String,
    date: Date,
    items: [{
      name: String,
      quantity: Number,
      unitPrice: Number,
      total: Number
    }],
    total: Number,
    tax: Number
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0]
    },
    address: String,
    city: String,
    country: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
  },
  recurringEndDate: Date,
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'paypal'],
    required: true,
    default: 'mpesa'
  },
  counterparty: {
    name: String,
    type: {
      type: String,
      enum: ['individual', 'business', 'bank', 'sacco', 'government']
    },
    phoneNumber: String,
    email: String,
    businessId: String
  },
  budgetId: {
    type: Schema.Types.ObjectId,
    ref: 'Budget'
  },
  goalId: {
    type: Schema.Types.ObjectId,
    ref: 'Goal'
  },
  challengeId: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ mpesaCode: 1 }, { unique: true, sparse: true });
transactionSchema.index({ 'location.coordinates': '2dsphere' });
transactionSchema.index({ tags: 1 });
transactionSchema.index({ status: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(this.amount);
});

// Pre-save middleware to update budget and goal
transactionSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'completed') {
    const session = this.$session();
    
    // Update budget if linked
    if (this.budgetId) {
      const Budget = mongoose.model('Budget');
      await Budget.findByIdAndUpdate(
        this.budgetId,
        { $inc: { spent: Math.abs(this.amount) } },
        { session }
      );
    }
    
    // Update goal if linked
    if (this.goalId && this.type === 'saving') {
      const Goal = mongoose.model('Goal');
      await Goal.findByIdAndUpdate(
        this.goalId,
        { 
          $inc: { currentAmount: Math.abs(this.amount) },
          $push: {
            contributions: {
              amount: Math.abs(this.amount),
              date: this.date,
              transactionId: this._id,
              type: this.isRecurring ? 'auto' : 'manual'
            }
          }
        },
        { session }
      );
    }
    
    // Update user stats
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
      this.userId,
      {
        $inc: {
          'stats.totalEarned': this.type === 'income' ? this.amount : 0,
          'stats.totalSpent': this.type === 'expense' ? Math.abs(this.amount) : 0,
          'stats.totalSaved': this.type === 'saving' ? Math.abs(this.amount) : 0,
          'stats.totalInvested': this.type === 'investment' ? Math.abs(this.amount) : 0,
          'stats.currentBalance': this.type === 'income' ? this.amount : 
                                 (this.type === 'expense' || this.type === 'saving' || this.type === 'investment') ? 
                                 -Math.abs(this.amount) : 0
        }
      },
      { session }
    );
  }
  next();
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
