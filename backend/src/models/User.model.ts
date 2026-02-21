import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { 
  IUser, 
  IUserPreferences, 
  INotificationPreferences,
  IMPesaPreferences,
  IPrivacySettings,
  IAccessibilitySettings,
  ISecuritySettings,
  ISubscription,
  UserRole,
  Currency,
  Language,
  Theme,
  SubscriptionPlan,
  PaymentMethod
} from '@/types';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^(254|0)?[17]\d{8}$/, 'Please enter a valid Kenyan phone number']
  },
  idNumber: {
    type: String,
    sparse: true,
    match: [/^\d{7,8}$/, 'Please enter a valid ID number']
  },
  kraPin: {
    type: String,
    sparse: true,
    uppercase: true,
    match: [/^[A-Z]\d{9}[A-Z]$/, 'Please enter a valid KRA PIN']
  },
  dateOfBirth: Date,
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  preferences: {
    currency: { type: String, enum: ['KES', 'USD', 'EUR', 'GBP'], default: 'KES' },
    language: { type: String, enum: ['en', 'sw', 'sheng'], default: 'en' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      dailySummary: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      monthlyReport: { type: Boolean, default: true },
      goalAlerts: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      investmentAlerts: { type: Boolean, default: true },
      transactionAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false }
    },
    mpesaIntegration: {
      autoSync: { type: Boolean, default: false },
      autoSyncInterval: { type: Number, default: 30 },
      roundUpEnabled: { type: Boolean, default: false },
      roundUpAmount: { type: Number, default: 100 },
      roundUpToNearest: { type: Number, default: 100 },
      stkPushDefault: { type: Boolean, default: true },
      fulizaAlerts: { type: Boolean, default: true },
      sendReceipts: { type: Boolean, default: true },
      defaultAccount: { type: String, default: 'personal' }
    },
    privacy: {
      shareAnonymizedData: { type: Boolean, default: false },
      publicProfile: { type: Boolean, default: false },
      showBalance: { type: Boolean, default: false },
      showTransactions: { type: Boolean, default: false },
      showGoals: { type: Boolean, default: false },
      showInvestments: { type: Boolean, default: false }
    },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false },
      reduceMotion: { type: Boolean, default: false },
      screenReader: { type: Boolean, default: false }
    }
  },
  stats: {
    totalSaved: { type: Number, default: 0 },
    totalInvested: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completedChallenges: { type: Number, default: 0 },
    achievements: [{ type: String }],
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    nextLevelExp: { type: Number, default: 1000 },
    rank: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
    joinDate: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    dailyLogin: [{ type: Date }]
  },
  roles: {
    type: [String],
    enum: ['user', 'premium', 'admin', 'superadmin'],
    default: ['user']
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  lastLogin: Date,
  lastActive: { type: Date, default: Date.now },
  mpesaTokens: {
    accessToken: String,
    refreshToken: String,
    expiresIn: Number,
    lastRefreshed: Date
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ['sms', 'email', 'app'] },
    biometricEnabled: { type: Boolean, default: false },
    loginNotifications: { type: Boolean, default: true },
    deviceHistory: [{
      deviceId: String,
      deviceName: String,
      deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop'] },
      os: String,
      browser: String,
      ip: String,
      location: String,
      lastActive: Date,
      isTrusted: { type: Boolean, default: false }
    }],
    trustedDevices: [String],
    lastPasswordChange: { type: Date, default: Date.now },
    passwordHistory: [String],
    securityQuestions: [{
      question: String,
      answerHash: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium', 'business'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    autoRenew: { type: Boolean, default: true },
    paymentMethod: { type: String, enum: ['mpesa', 'card', 'bank', 'paypal'] },
    features: [String],
    limits: {
      maxTransactions: { type: Number, default: 1000 },
      maxGoals: { type: Number, default: 5 },
      maxInvestments: { type: Number, default: 10 },
      maxChallenges: { type: Number, default: 3 },
      maxTeamMembers: { type: Number, default: 1 },
      dataRetention: { type: Number, default: 365 },
      apiCallsPerDay: { type: Number, default: 1000 },
      storage: { type: Number, default: 100 }
    },
    invoices: [{
      id: String,
      amount: Number,
      currency: { type: String, default: 'KES' },
      status: { type: String, enum: ['paid', 'pending', 'failed'] },
      date: { type: Date, default: Date.now },
      dueDate: Date,
      items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
      }],
      paymentMethod: { type: String, enum: ['mpesa', 'card', 'bank', 'paypal'] },
      paymentReference: String
    }]
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.mpesaTokens;
      delete ret.security.passwordHistory;
      delete ret.security.securityQuestions;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ 'stats.level': -1 });
userSchema.index({ 'stats.streakDays': -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActive: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    this.password = await bcrypt.hash(this.password, salt);
    
    // Add to password history
    if (this.security && this.security.passwordHistory) {
      this.security.passwordHistory.push(this.password);
      // Keep only last 5 passwords
      if (this.security.passwordHistory.length > 5) {
        this.security.passwordHistory.shift();
      }
    }
    
    this.security.lastPasswordChange = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

// Update lastActive on any save
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 86400000; // 24 hours
  return verificationToken;
};

// Check if password was used before
userSchema.methods.wasPasswordUsed = async function(newPassword: string): Promise<boolean> {
  for (const oldPasswordHash of this.security.passwordHistory || []) {
    if (await bcrypt.compare(newPassword, oldPasswordHash)) {
      return true;
    }
  }
  return false;
};

// Update streak
userSchema.methods.updateStreak = function(): void {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActive = this.lastActive ? new Date(this.lastActive).setHours(0, 0, 0, 0) : null;
  
  if (lastActive === today) {
    // Already logged in today
    return;
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastActive === yesterday.getTime()) {
    // Consecutive day
    this.stats.streakDays += 1;
    if (this.stats.streakDays > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.streakDays;
    }
  } else {
    // Streak broken
    this.stats.streakDays = 1;
  }
  
  // Add to daily login history
  this.stats.dailyLogin.push(new Date());
  // Keep only last 30 days
  if (this.stats.dailyLogin.length > 30) {
    this.stats.dailyLogin.shift();
  }
};

// Add experience points
userSchema.methods.addExperience = function(amount: number): void {
  this.stats.experience += amount;
  
  // Check for level up
  while (this.stats.experience >= this.stats.nextLevelExp) {
    this.stats.level += 1;
    this.stats.experience -= this.stats.nextLevelExp;
    this.stats.nextLevelExp = Math.floor(this.stats.nextLevelExp * 1.5);
  }
  
  // Update rank based on level
  if (this.stats.level >= 50) this.stats.rank = 'diamond';
  else if (this.stats.level >= 30) this.stats.rank = 'platinum';
  else if (this.stats.level >= 20) this.stats.rank = 'gold';
  else if (this.stats.level >= 10) this.stats.rank = 'silver';
};

export const User = mongoose.model<IUser>('User', userSchema);
