import { DailyActivity, FinancialQuote } from '@/types';
import { addDays } from 'date-fns';

export const generateMockContributionData = (year: number): DailyActivity[] => {
  const data: DailyActivity[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const baseCount = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 4;
    const count = Math.max(0, Math.floor(Math.random() * baseCount * 2));
    
    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) intensity = count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
    
    data.push({
      date: new Date(currentDate),
      count,
      intensity,
      transactions: [],
      hasSavings: Math.random() > 0.7,
      hasInvestment: Math.random() > 0.8,
      budgetAdherence: Math.random() * 100,
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return data;
};

export const mockQuotes: FinancialQuote[] = [
  {
    id: '1',
    text: 'Do not save what is left after spending, but spend what is left after saving.',
    author: 'Warren Buffett',
    category: 'saving',
    language: 'en'
  },
  {
    id: '2',
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb',
    category: 'investment',
    language: 'en'
  },
  {
    id: '3',
    text: 'Pesa ni mizizi, usiipoteze bure.',
    author: 'Kenyan Proverb',
    category: 'saving',
    language: 'sw'
  }
];

export const mockGoals = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 300000,
    currentAmount: 150000,
    deadline: new Date(2024, 11, 31),
    category: 'savings',
    priority: 'high'
  },
  {
    id: '2',
    name: 'House Deposit',
    targetAmount: 1000000,
    currentAmount: 200000,
    deadline: new Date(2025, 11, 31),
    category: 'savings',
    priority: 'medium'
  }
];

export const mockBudgets = [
  {
    id: '1',
    category: 'Food',
    amount: 15000,
    spent: 12350,
    period: 'monthly'
  },
  {
    id: '2',
    category: 'Transport',
    amount: 5000,
    spent: 3200,
    period: 'monthly'
  },
  {
    id: '3',
    category: 'Entertainment',
    amount: 3000,
    spent: 2750,
    period: 'monthly'
  }
];
