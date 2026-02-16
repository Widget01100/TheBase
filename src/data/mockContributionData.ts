import { DailyActivity, Transaction } from '@/types';
import { format, subDays, addDays } from 'date-fns';

export const generateMockTransactions = (date: Date, count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const categories = ['food', 'transport', 'salary', 'savings', 'investment', 'entertainment'];
  
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.7 ? 'income' : 'expense';
    const amount = type === 'income' 
      ? Math.floor(Math.random() * 50000) + 1000
      : Math.floor(Math.random() * 10000) + 100;
    
    transactions.push({
      id: `tx-${format(date, 'yyyyMMdd')}-${i}`,
      userId: 'user1',
      amount: type === 'income' ? amount : -amount,
      type,
      category: categories[Math.floor(Math.random() * categories.length)] as any,
      description: type === 'income' ? 'Salary' : 'Shopping',
      date,
      tags: [],
    });
  }
  
  return transactions;
};

export const getIntensity = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
};

export const generateMockData = (year: number): DailyActivity[] => {
  const data: DailyActivity[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    // Generate more activity on weekdays and less on weekends
    const dayOfWeek = currentDate.getDay();
    const baseCount = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 3;
    
    // Random variation
    const count = Math.max(0, Math.floor(Math.random() * baseCount * 3));
    
    // Sometimes add a big day
    const finalCount = Math.random() > 0.9 ? count * 3 : count;
    
    const transactions = generateMockTransactions(currentDate, finalCount);
    const hasSavings = transactions.some(t => t.category === 'savings');
    const hasInvestment = transactions.some(t => t.category === 'investment');
    
    data.push({
      date: new Date(currentDate),
      count: finalCount,
      intensity: getIntensity(finalCount),
      transactions,
      hasSavings,
      hasInvestment,
      budgetAdherence: Math.random() * 100,
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return data;
};

export const generateStreakData = (days: number, streakLength: number): DailyActivity[] => {
  const data: DailyActivity[] = [];
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  let currentDate = startDate;
  let streakCounter = 0;
  
  while (currentDate <= endDate) {
    const isInStreak = streakCounter < streakLength && days - (days - streakCounter) > days - streakLength;
    
    const count = isInStreak ? Math.floor(Math.random() * 5) + 1 : 0;
    
    data.push({
      date: new Date(currentDate),
      count,
      intensity: getIntensity(count),
      transactions: count > 0 ? generateMockTransactions(currentDate, count) : [],
      hasSavings: count > 0 && Math.random() > 0.5,
      hasInvestment: count > 0 && Math.random() > 0.7,
    });
    
    if (isInStreak) streakCounter++;
    currentDate = addDays(currentDate, 1);
  }
  
  return data;
};
