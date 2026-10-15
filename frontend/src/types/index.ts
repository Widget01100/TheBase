// src/types/index.ts
// Frontend type definitions for The Base

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'investment' | 'saving';
  category: string;
  description: string;
  date: Date;
  mpesaCode?: string;
  tags: string[];
}

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

export interface FinancialQuote {
  id: string;
  text: string;
  author: string;
  category: string;
  language: 'en' | 'sw' | 'sheng';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
}

export interface Investment {
  id: string;
  type: string;
  name: string;
  amount: number;
  returns: number;
  risk: 'low' | 'medium' | 'high';
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: number;
  targetAmount?: number;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  preferences: {
    currency: 'KES' | 'USD' | 'EUR';
    language: 'en' | 'sw' | 'sheng';
    darkMode: boolean;
  };
}

// ─── Runtime anchor (so Vite always emits this module) ───
export const TYPES_VERSION = '1.0.0';

// ─── Convenience type aliases ───
export type TransactionType = Transaction['type'];
export type GoalPriority = Goal['priority'];
export type RiskLevel = Investment['risk'];
export type DailyActivityIntensity = DailyActivity['intensity'];
