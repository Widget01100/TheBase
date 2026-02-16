// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt: Date;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  currency: 'KES' | 'USD' | 'EUR';
  language: 'en' | 'sw' | 'sheng';
  darkMode: boolean;
  notifications: NotificationPreferences;
  mpesaIntegration: MpesaPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  goalAlerts: boolean;
}

export interface MpesaPreferences {
  autoSync: boolean;
  roundUpEnabled: boolean;
  roundUpAmount: number;
  stkPushDefault: boolean;
  fulizaAlerts: boolean;
}

export interface UserStats {
  totalSaved: number;
  totalInvested: number;
  currentBalance: number;
  streakDays: number;
  completedChallenges: number;
  joinDate: Date;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'investment' | 'saving';
  category: TransactionCategory;
  description: string;
  date: Date;
  mpesaCode?: string;
  mpesaData?: MpesaTransaction;
  receipt?: Receipt;
  tags: string[];
  location?: string;
  notes?: string;
}

export type TransactionCategory = 
  | 'salary' | 'business' | 'investment' | 'gift' | 'other_income'
  | 'food' | 'transport' | 'housing' | 'utilities' | 'entertainment'
  | 'healthcare' | 'education' | 'shopping' | 'savings' | 'debt'
  | 'airtime' | 'mpesa_fees' | 'fuliza' | 'sacco' | 'mmf';

export interface MpesaTransaction {
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
}

// Contribution Grid types
export interface DailyActivity {
  date: Date;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  transactions: Transaction[];
  hasSavings: boolean;
  hasInvestment: boolean;
  budgetAdherence?: number;
  notes?: string;
}

export interface ContributionData {
  year: number;
  activities: DailyActivity[];
  totalTransactions: number;
  totalSaved: number;
  totalSpent: number;
  bestStreak: number;
  currentStreak: number;
}

// Budget types
export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  alerts: boolean;
  rollover: boolean;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  threshold: number; // percentage
  triggered: boolean;
  message: string;
  date: Date;
}

// Goal types
export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: 'savings' | 'investment' | 'debt' | 'purchase';
  priority: 'low' | 'medium' | 'high';
  autoSave: boolean;
  autoSaveAmount?: number;
  autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
  image?: string;
  completed: boolean;
  completedDate?: Date;
}

// Investment types
export interface Investment {
  id: string;
  userId: string;
  type: 'mmf' | 'sacco' | 'stocks' | 'bonds' | 'real_estate' | 'crypto' | 'other';
  name: string;
  amount: number;
  returns: number;
  returnsPercentage: number;
  startDate: Date;
  maturityDate?: Date;
  risk: 'low' | 'medium' | 'high';
  provider: string;
  notes?: string;
}

export interface MMF {
  id: string;
  name: string;
  provider: string;
  interestRate: number;
  minimumInvestment: number;
  liquidity: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Sacco {
  id: string;
  name: string;
  registrationNumber: string;
  interestRate: number;
  dividendRate: number;
  minimumShares: number;
  monthlyContributions: number;
}

// Challenge types
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'saving' | 'investment' | 'budget' | 'education';
  duration: number; // in days
  targetAmount?: number;
  participants: number;
  badge: Badge;
  rules: ChallengeRule[];
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  startDate: Date;
  currentProgress: number;
  completed: boolean;
  completedDate?: Date;
  earnedBadge?: Badge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface ChallengeRule {
  id: string;
  description: string;
  requirement: number;
  reward: string;
}

// AI Coach types
export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  context?: {
    transaction?: Transaction;
    goal?: FinancialGoal;
    budget?: Budget;
  };
}

export interface FinancialAdvice {
  id: string;
  userId: string;
  type: 'spending' | 'saving' | 'investment' | 'debt' | 'general';
  title: string;
  content: string;
  action?: string;
  impact: 'low' | 'medium' | 'high';
  date: Date;
  implemented?: boolean;
}

export interface MoneyLeak {
  id: string;
  userId: string;
  source: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: TransactionCategory;
  suggestion: string;
  potentialSavings: number;
}

// Calculator types
export interface FIRECalculation {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlySavings: number;
  expectedReturn: number;
  inflationRate: number;
  desiredMonthlyIncome: number;
  safeWithdrawalRate: number;
  result: {
    fireNumber: number;
    yearsToFire: number;
    totalSavings: number;
    monthlyIncome: number;
    successRate: number;
  };
}

export interface EducationPlan {
  childAge: number;
  universityAge: number;
  universityType: 'public' | 'private' | 'international';
  course: string;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  result: {
    totalNeeded: number;
    projectedAmount: number;
    shortfall: number;
    monthlyNeeded: number;
  };
}

export interface MMFComparison {
  mmf1: string;
  mmf2: string;
  amount: number;
  period: number;
  result: {
    returns1: number;
    returns2: number;
    difference: number;
    recommendation: string;
  };
}

// Quote types
export interface FinancialQuote {
  id: string;
  text: string;
  author: string;
  category: 'investment' | 'saving' | 'wealth' | 'success' | 'education';
  language: 'en' | 'sw' | 'sheng';
  source?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
