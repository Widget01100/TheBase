// ============================================
// USER TYPES
// ============================================

export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idNumber?: string;
  kraPin?: string;
  dateOfBirth?: Date;
  profilePicture?: string;
  preferences: IUserPreferences;
  stats: IUserStats;
  roles: UserRole[];
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLogin?: Date;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  mpesaTokens?: IMPesaTokens;
  security: ISecuritySettings;
  subscription: ISubscription;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPreferences {
  currency: Currency;
  language: Language;
  theme: Theme;
  notifications: INotificationPreferences;
  mpesaIntegration: IMPesaPreferences;
  privacy: IPrivacySettings;
  accessibility: IAccessibilitySettings;
}

export interface INotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  goalAlerts: boolean;
  budgetAlerts: boolean;
  investmentAlerts: boolean;
  transactionAlerts: boolean;
  marketingEmails: boolean;
}

export interface IMPesaPreferences {
  autoSync: boolean;
  autoSyncInterval: number; // minutes
  roundUpEnabled: boolean;
  roundUpAmount: number;
  roundUpToNearest: number;
  stkPushDefault: boolean;
  fulizaAlerts: boolean;
  sendReceipts: boolean;
  defaultAccount: string;
}

export interface IPrivacySettings {
  shareAnonymizedData: boolean;
  publicProfile: boolean;
  showBalance: boolean;
  showTransactions: boolean;
  showGoals: boolean;
  showInvestments: boolean;
}

export interface IAccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

export interface IUserStats {
  totalSaved: number;
  totalInvested: number;
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  streakDays: number;
  longestStreak: number;
  completedChallenges: number;
  achievements: string[];
  level: number;
  experience: number;
  nextLevelExp: number;
  rank: UserRank;
  joinDate: Date;
  lastActive: Date;
  dailyLogin: Date[];
}

export interface ISecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'sms' | 'email' | 'app';
  biometricEnabled: boolean;
  loginNotifications: boolean;
  deviceHistory: IDeviceInfo[];
  trustedDevices: string[];
  lastPasswordChange: Date;
  passwordHistory: string[];
  securityQuestions: ISecurityQuestion[];
}

export interface IDeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  ip: string;
  location?: string;
  lastActive: Date;
  isTrusted: boolean;
}

export interface ISecurityQuestion {
  question: string;
  answerHash: string;
  createdAt: Date;
}

export interface ISubscription {
  plan: SubscriptionPlan;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  paymentMethod: PaymentMethod;
  features: string[];
  limits: ISubscriptionLimits;
  invoices: IInvoice[];
}

export interface ISubscriptionLimits {
  maxTransactions: number;
  maxGoals: number;
  maxInvestments: number;
  maxChallenges: number;
  maxTeamMembers: number;
  dataRetention: number; // days
  apiCallsPerDay: number;
  storage: number; // MB
}

export type UserRole = 'user' | 'premium' | 'admin' | 'superadmin';
export type UserRank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';
export type Language = 'en' | 'sw' | 'sheng';
export type Theme = 'light' | 'dark' | 'system';
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'business';
export type PaymentMethod = 'mpesa' | 'card' | 'bank' | 'paypal';

export interface IMPesaTokens {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  lastRefreshed?: Date;
}

export interface IInvoice {
  id: string;
  amount: number;
  currency: Currency;
  status: 'paid' | 'pending' | 'failed';
  date: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  paymentMethod: PaymentMethod;
  paymentReference?: string;
}

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export interface ITransaction {
  _id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  date: Date;
  mpesaCode?: string;
  mpesaData?: IMPesaTransaction;
  receipt?: IReceipt;
  tags: string[];
  location?: ILocation;
  notes?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringEndDate?: Date;
  attachments: IAttachment[];
  metadata: Record<string, any>;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  counterparty?: ICounterparty;
  budgetId?: string;
  goalId?: string;
  challengeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment' | 'saving' | 'loan' | 'refund' | 'fee';
export type TransactionCategory = 
  | 'salary' | 'business' | 'investment_income' | 'gift' | 'other_income'
  | 'food' | 'transport' | 'housing' | 'utilities' | 'entertainment'
  | 'healthcare' | 'education' | 'shopping' | 'savings' | 'debt_payment'
  | 'airtime' | 'mpesa_fees' | 'fuliza' | 'sacco' | 'mmf' | 'stocks'
  | 'insurance' | 'tax' | 'charity' | 'travel' | 'subscription';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface IMPesaTransaction {
  transactionId: string;
  transactionDate: Date;
  transactionTime: string;
  fullNames: string;
  phoneNumber: string;
  amount: number;
  accountNumber?: string;
  commandId: string;
  receiptNumber: string;
  balance?: number;
  rawMessage: string;
  businessShortCode?: string;
  thirdPartyId?: string;
}

export interface IReceipt {
  url: string;
  uploadedAt: Date;
  parsedData?: any;
  ocrText?: string;
  merchant?: string;
  date?: Date;
  items?: IReceiptItem[];
  total?: number;
  tax?: number;
}

export interface IReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  city?: string;
  country?: string;
}

export interface ICounterparty {
  name: string;
  type: 'individual' | 'business' | 'bank' | 'sacco' | 'government';
  phoneNumber?: string;
  email?: string;
  businessId?: string;
}

// ============================================
// BUDGET TYPES
// ============================================

export interface IBudget {
  _id: string;
  userId: string;
  name: string;
  category: TransactionCategory;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  alerts: boolean;
  alertThreshold: number; // percentage
  rollover: boolean;
  rolloverAmount?: number;
  categories: TransactionCategory[];
  notes?: string;
  status: BudgetStatus;
  alertsSent: IBudgetAlert[];
  createdAt: Date;
  updatedAt: Date;
}

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type BudgetStatus = 'active' | 'paused' | 'completed' | 'expired';

export interface IBudgetAlert {
  id: string;
  threshold: number;
  triggeredAt: Date;
  message: string;
  sentVia: ('email' | 'sms' | 'push')[];
  acknowledged: boolean;
}

// ============================================
// GOAL TYPES
// ============================================

export interface IGoal {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: GoalCategory;
  priority: GoalPriority;
  autoSave: boolean;
  autoSaveAmount?: number;
  autoSaveFrequency?: RecurringPattern;
  autoSaveSource?: string;
  notes?: string;
  image?: string;
  completed: boolean;
  completedDate?: Date;
  milestones: IGoalMilestone[];
  contributions: IGoalContribution[];
  reminders: IGoalReminder[];
  status: GoalStatus;
  progress: number;
  projectedCompletionDate?: Date;
  isOnTrack: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type GoalCategory = 'savings' | 'investment' | 'debt' | 'purchase' | 'emergency' | 'retirement' | 'education' | 'travel' | 'other';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'overdue';

export interface IGoalMilestone {
  id: string;
  name: string;
  targetAmount: number;
  achieved: boolean;
  achievedDate?: Date;
  reward?: string;
}

export interface IGoalContribution {
  id: string;
  amount: number;
  date: Date;
  transactionId?: string;
  note?: string;
  type: 'manual' | 'auto' | 'roundup' | 'bonus';
}

export interface IGoalReminder {
  id: string;
  date: Date;
  sent: boolean;
  type: 'weekly' | 'monthly' | 'custom';
  message?: string;
}

// ============================================
// INVESTMENT TYPES
// ============================================

export interface IInvestment {
  _id: string;
  userId: string;
  type: InvestmentType;
  name: string;
  provider: string;
  accountNumber?: string;
  amount: number;
  returns: number;
  returnsPercentage: number;
  startDate: Date;
  maturityDate?: Date;
  risk: RiskLevel;
  liquidity: LiquidityLevel;
  notes?: string;
  transactions: IInvestmentTransaction[];
  performance: IInvestmentPerformance[];
  dividends: IDividend[];
  status: InvestmentStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type InvestmentType = 'mmf' | 'sacco' | 'stocks' | 'bonds' | 't-bills' | 'real_estate' | 'crypto' | 'commodities' | 'other';
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type LiquidityLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type InvestmentStatus = 'active' | 'matured' | 'withdrawn' | 'sold' | 'defaulted';

export interface IInvestmentTransaction {
  id: string;
  date: Date;
  type: 'buy' | 'sell' | 'dividend' | 'interest';
  units?: number;
  price?: number;
  amount: number;
  fees?: number;
  notes?: string;
}

export interface IInvestmentPerformance {
  date: Date;
  value: number;
  returns: number;
  returnsPercentage: number;
}

export interface IDividend {
  id: string;
  date: Date;
  amount: number;
  rate?: number;
  status: 'paid' | 'pending' | 'reinvested';
}

// ============================================
// CHALLENGE TYPES
// ============================================

export interface IChallenge {
  _id: string;
  name: string;
  description: string;
  type: ChallengeType;
  duration: number; // in days
  targetAmount?: number;
  targetAction?: string;
  rules: IChallengeRule[];
  badge: IBadge;
  participants: number;
  completedCount: number;
  featured: boolean;
  difficulty: ChallengeDifficulty;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserChallenge {
  _id: string;
  userId: string;
  challengeId: string;
  startDate: Date;
  currentProgress: number;
  completed: boolean;
  completedDate?: Date;
  earnedBadge?: IBadge;
  milestones: IUserChallengeMilestone[];
  status: UserChallengeStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChallengeType = 'saving' | 'investment' | 'budget' | 'education' | 'fitness' | 'custom';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type UserChallengeStatus = 'active' | 'paused' | 'completed' | 'failed' | 'abandoned';

export interface IChallengeRule {
  id: string;
  description: string;
  requirement: number;
  reward: string;
  unit: string;
}

export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  points: number;
  requirements: string[];
  unlockedBy: number;
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface IUserChallengeMilestone {
  id: string;
  name: string;
  achieved: boolean;
  achievedDate?: Date;
  progress: number;
  reward?: string;
}

// ============================================
// AI COACH TYPES
// ============================================

export interface IChatMessage {
  _id: string;
  userId: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  context?: IChatContext;
  attachments?: IChatAttachment[];
  reactions?: string[];
  read: boolean;
}

export interface IChatSession {
  _id: string;
  userId: string;
  title: string;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
  topics: string[];
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  feedback?: IChatFeedback;
}

export interface IChatContext {
  transaction?: ITransaction;
  goal?: IGoal;
  budget?: IBudget;
  investment?: IInvestment;
  challenge?: IChallenge;
  userStats?: IUserStats;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface IChatAttachment {
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
}

export interface IChatFeedback {
  rating: number; // 1-5
  comment?: string;
  timestamp: Date;
}

export interface IFinancialAdvice {
  _id: string;
  userId: string;
  type: AdviceType;
  title: string;
  content: string;
  action?: string;
  impact: ImpactLevel;
  date: Date;
  implemented?: boolean;
  implementedDate?: Date;
  feedback?: AdviceFeedback;
  expiresAt?: Date;
}

export type AdviceType = 'spending' | 'saving' | 'investment' | 'debt' | 'budget' | 'general';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AdviceFeedback {
  helpful: boolean;
  rating?: number;
  comment?: string;
  date: Date;
}

export interface IMoneyLeak {
  _id: string;
  userId: string;
  source: string;
  amount: number;
  frequency: RecurringPattern;
  category: TransactionCategory;
  suggestion: string;
  potentialSavings: number;
  detectedAt: Date;
  status: 'new' | 'reviewed' | 'actioned' | 'ignored';
  actionTaken?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  read: boolean;
  readAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  actions?: INotificationAction[];
  expiresAt?: Date;
  createdAt: Date;
}

export type NotificationType = 
  | 'budget_alert' | 'goal_progress' | 'investment_update' 
  | 'transaction_alert' | 'challenge_update' | 'achievement_unlocked'
  | 'weekly_report' | 'daily_summary' | 'system_update'
  | 'security_alert' | 'payment_reminder' | 'ai_insight';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface INotificationAction {
  id: string;
  label: string;
  action: string;
  url?: string;
  data?: Record<string, any>;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  method?: string;
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  errors?: any[];
  stack?: string;
  timestamp: string;
}

// ============================================
// JOB TYPES
// ============================================

export interface IJobData {
  id: string;
  type: JobType;
  status: JobStatus;
  data: any;
  attempts: number;
  maxAttempts: number;
  priority: number;
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

export type JobType = 
  | 'process_transaction' | 'send_notification' | 'generate_report'
  | 'sync_mpesa' | 'calculate_interest' | 'backup_database'
  | 'process_recurring' | 'cleanup_files' | 'send_emails'
  | 'update_investment_prices';

export type JobStatus = 
  | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'retry';

// ============================================
// ANALYTICS TYPES
// ============================================

export interface IAnalyticsEvent {
  _id: string;
  userId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  device: IDeviceInfo;
}

export interface IUserInsights {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  spending: ISpendingInsights;
  saving: ISavingInsights;
  investing: IInvestingInsights;
  trends: ITrendInsights[];
  recommendations: IRecommendation[];
}

export interface ISpendingInsights {
  total: number;
  byCategory: Record<string, number>;
  byDay: Record<string, number>;
  averagePerDay: number;
  highestDay: number;
  highestCategory: string;
  trends: number;
  projections: number;
}

export interface ISavingInsights {
  total: number;
  rate: number;
  streak: number;
  byGoal: Record<string, number>;
  byMethod: Record<string, number>;
  trends: number;
  projections: number;
}

export interface IInvestingInsights {
  total: number;
  returns: number;
  returnsPercentage: number;
  byType: Record<string, number>;
  riskDistribution: Record<string, number>;
  dividends: number;
  trends: number;
  projections: number;
}

export interface ITrendInsights {
  metric: string;
  values: number[];
  dates: Date[];
  change: number;
  percentageChange: number;
  significance: number;
}

export interface IRecommendation {
  id: string;
  type: AdviceType;
  title: string;
  description: string;
  impact: ImpactLevel;
  potentialSavings?: number;
  actionUrl?: string;
  priority: number;
}
