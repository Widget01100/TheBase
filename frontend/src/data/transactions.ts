// src/data/transactions.ts
// SINGLE SOURCE OF TRUTH for all transactions in the app.
// Now uses a realistic generated dataset spanning 2024 → current month.

import { generateTransactions } from './generateTransactions';

export interface AppTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'investment' | 'saving';
  category: string;
  date: Date;time: string;
  icon: any;
  merchant: string;
  location?: string;
  status: 'completed' | 'pending';
  tags: string[];
}

// Generate transactions from Jan 2024 → today (or current month)
export const initialTransactions: AppTransaction[] = generateTransactions(2024, new Date());
