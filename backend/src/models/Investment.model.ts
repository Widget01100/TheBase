import mongoose, { Document, Schema } from 'mongoose';
import { IInvestment, InvestmentType, RiskLevel, LiquidityLevel, InvestmentStatus } from '@/types';

const investmentSchema = new Schema<IInvestment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['mmf', 'sacco', 'stocks', 'bonds', 't-bills', 'real_estate', 'crypto', 'commodities', 'other'],
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  returns: {
    type: Number,
    default: 0
  },
  returnsPercentage: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  maturityDate: Date,
  risk: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    required: true
  },
  liquidity: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    required: true
  },
  notes: String,
  transactions: [{
    id: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['buy', 'sell', 'dividend', 'interest'], required: true },
    units: Number,
    price: Number,
    amount: { type: Number, required: true },
    fees: Number,
    notes: String
  }],
  performance: [{
    date: { type: Date, required: true },
    value: { type: Number, required: true },
    returns: { type: Number, required: true },
    returnsPercentage: { type: Number, required: true }
  }],
  dividends: [{
    id: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    rate: Number,
    status: { type: String, enum: ['paid', 'pending', 'reinvested'], default: 'paid' }
  }],
  status: {
    type: String,
    enum: ['active', 'matured', 'withdrawn', 'sold', 'defaulted'],
    default: 'active',
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
investmentSchema.index({ userId: 1, type: 1 });
investmentSchema.index({ userId: 1, status: 1 });
investmentSchema.index({ provider: 1 });
investmentSchema.index({ risk: 1 });
investmentSchema.index({ returnsPercentage: -1 });

// Virtual for total value including returns
investmentSchema.virtual('totalValue').get(function() {
  return this.amount + this.returns;
});

// Virtual for ROI
investmentSchema.virtual('roi').get(function() {
  if (this.amount === 0) return 0;
  return (this.returns / this.amount) * 100;
});

// Method to add transaction
investmentSchema.methods.addTransaction = async function(
  type: 'buy' | 'sell' | 'dividend' | 'interest',
  amount: number,
  units?: number,
  price?: number,
  fees?: number,
  notes?: string
) {
  const transaction = {
    id: new mongoose.Types.ObjectId().toString(),
    date: new Date(),
    type,
    amount,
    units,
    price,
    fees,
    notes
  };
  
  this.transactions.push(transaction);
  
  // Update amount based on transaction type
  if (type === 'buy') {
    this.amount += amount;
  } else if (type === 'sell') {
    this.amount -= amount;
  } else if (type === 'dividend' || type === 'interest') {
    this.returns += amount;
    this.dividends.push({
      id: new mongoose.Types.ObjectId().toString(),
      date: new Date(),
      amount,
      status: 'paid'
    });
  }
  
  // Update returns percentage
  if (this.amount > 0) {
    this.returnsPercentage = (this.returns / this.amount) * 100;
  }
  
  // Add performance entry
  this.performance.push({
    date: new Date(),
    value: this.amount + this.returns,
    returns: this.returns,
    returnsPercentage: this.returnsPercentage
  });
  
  // Keep only last 365 performance entries
  if (this.performance.length > 365) {
    this.performance = this.performance.slice(-365);
  }
  
  return this.save();
};

// Method to calculate projected returns
investmentSchema.methods.calculateProjection = function(years: number, expectedReturn?: number) {
  const rate = expectedReturn || this.returnsPercentage / 100;
  const currentValue = this.amount + this.returns;
  
  const projection = [];
  for (let i = 1; i <= years; i++) {
    const value = currentValue * Math.pow(1 + rate, i);
    projection.push({
      year: new Date().getFullYear() + i,
      value,
      returns: value - currentValue
    });
  }
  
  return projection;
};

// Static method to get Kenyan MMF providers
investmentSchema.statics.getKenyanMMFProviders = function() {
  return [
    { name: 'CIC Money Market Fund', provider: 'CIC Asset Management', minAmount: 1000, returnRate: 8.5 },
    { name: 'Sanlam Money Market Fund', provider: 'Sanlam Investments', minAmount: 500, returnRate: 8.2 },
    { name: 'Britam Money Market Fund', provider: 'Britam Asset Managers', minAmount: 1000, returnRate: 8.7 },
    { name: 'NCBA Money Market Fund', provider: 'NCBA Bank', minAmount: 5000, returnRate: 8.3 },
    { name: 'Cytonn Money Market Fund', provider: 'Cytonn Investments', minAmount: 10000, returnRate: 9.0 },
    { name: 'GenAfrica Money Market Fund', provider: 'GenAfrica Asset Managers', minAmount: 1000, returnRate: 8.4 },
    { name: 'Old Mutual Money Market Fund', provider: 'Old Mutual', minAmount: 1000, returnRate: 8.1 },
    { name: 'Madison Money Market Fund', provider: 'Madison Asset Management', minAmount: 1000, returnRate: 8.6 }
  ];
};

// Static method to get Kenyan Saccos
investmentSchema.statics.getKenyanSaccos = function() {
  return [
    { name: 'Stima Sacco', provider: 'Stima DT Sacco', minDeposit: 1000, dividendRate: 12 },
    { name: 'Mwalimu National', provider: 'Mwalimu National Sacco', minDeposit: 1000, dividendRate: 11 },
    { name: 'Harambee Sacco', provider: 'Harambee Co-operative', minDeposit: 1000, dividendRate: 10.5 },
    { name: 'Kenya Police Sacco', provider: 'Kenya Police DT Sacco', minDeposit: 1000, dividendRate: 11.5 },
    { name: 'Imarika Sacco', provider: 'Imarika DT Sacco', minDeposit: 1000, dividendRate: 10.8 },
    { name: 'Unaitas Sacco', provider: 'Unaitas DT Sacco', minDeposit: 1000, dividendRate: 11.2 }
  ];
};

// Static method to get NSE stocks
investmentSchema.statics.getNSEStocks = function() {
  return [
    { symbol: 'SCOM', name: 'Safaricom PLC', sector: 'Telecom', price: 42.50 },
    { symbol: 'EQTY', name: 'Equity Group', sector: 'Banking', price: 48.75 },
    { symbol: 'KCB', name: 'KCB Group', sector: 'Banking', price: 38.90 },
    { symbol: 'EABL', name: 'EABL', sector: 'Beverage', price: 152.00 },
    { symbol: 'COOP', name: 'Co-operative Bank', sector: 'Banking', price: 14.25 },
    { symbol: 'ABSA', name: 'ABSA Bank', sector: 'Banking', price: 12.80 },
    { symbol: 'SBIC', name: 'Stanbic Bank', sector: 'Banking', price: 98.50 },
    { symbol: 'KNRE', name: 'Kenya Re', sector: 'Insurance', price: 3.20 },
    { symbol: 'KPLC', name: 'KPLC', sector: 'Energy', price: 4.85 },
    { symbol: 'BAMB', name: 'Bamburi Cement', sector: 'Manufacturing', price: 42.50 }
  ];
};

export const Investment = mongoose.model<IInvestment>('Investment', investmentSchema);
