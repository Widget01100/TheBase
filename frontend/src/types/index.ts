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

export interface FinancialQuote {
  id: string;
  text: string;
  author: string;
  category: string;
  language: 'en' | 'sw' | 'sheng';
}
