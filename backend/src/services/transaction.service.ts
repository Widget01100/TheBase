import { Transaction } from '@/models/Transaction.model';
import { User } from '@/models/User.model';
import { Goal } from '@/models/Goal.model';
import { Budget } from '@/models/Budget.model';
import { NotificationService } from './notification.service';
import { AICoachService } from './ai-coach.service';
import { AppError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

export class TransactionService {
  private static instance: TransactionService;
  private notificationService: NotificationService;
  private aiCoachService: AICoachService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.aiCoachService = AICoachService.getInstance();
  }

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  // Create transaction
  public async createTransaction(
    userId: string,
    transactionData: any,
    session?: mongoose.ClientSession
  ): Promise<any> {
    const transaction = await Transaction.create([{
      userId,
      ...transactionData,
      status: 'completed'
    }], { session });

    const created = transaction[0];

    // Update user balance
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          'stats.currentBalance': created.type === 'income' ? created.amount : -Math.abs(created.amount),
          'stats.totalEarned': created.type === 'income' ? created.amount : 0,
          'stats.totalSpent': created.type === 'expense' ? Math.abs(created.amount) : 0,
          'stats.totalSaved': created.type === 'saving' ? Math.abs(created.amount) : 0,
          'stats.totalInvested': created.type === 'investment' ? Math.abs(created.amount) : 0
        }
      },
      { session }
    );

    // Update goal if linked
    if (created.goalId && (created.type === 'saving' || created.type === 'income')) {
      await Goal.findByIdAndUpdate(
        created.goalId,
        {
          $inc: { currentAmount: Math.abs(created.amount) },
          $push: {
            contributions: {
              amount: Math.abs(created.amount),
              date: created.date,
              transactionId: created._id,
              type: created.isRecurring ? 'auto' : 'manual'
            }
          }
        },
        { session }
      );
    }

    // Update budget if linked
    if (created.budgetId && created.type === 'expense') {
      await Budget.findByIdAndUpdate(
        created.budgetId,
        {
          $inc: { spent: Math.abs(created.amount) }
        },
        { session }
      );
    }

    // Check for round-up savings
    if (created.type === 'expense' && created.paymentMethod === 'mpesa') {
      await this.checkRoundUp(userId, created);
    }

    // Send notification
    await this.notificationService.createTransactionAlert(userId, created);

    // Check for insights
    await this.checkForInsights(userId);

    return created;
  }

  // Check for round-up savings
  private async checkRoundUp(userId: string, transaction: any): Promise<void> {
    const user = await User.findById(userId);
    
    if (user?.preferences.mpesaIntegration.roundUpEnabled) {
      const roundUpAmount = Math.ceil(Math.abs(transaction.amount) / 100) * 100 - Math.abs(transaction.amount);
      
      if (roundUpAmount > 0) {
        await this.createTransaction(userId, {
          amount: roundUpAmount,
          type: 'saving',
          category: 'savings',
          description: `Round-up from ${transaction.description}`,
          date: new Date(),
          paymentMethod: 'mpesa',
          metadata: {
            parentTransaction: transaction._id,
            roundUp: true
          }
        });
      }
    }
  }

  // Check for insights
  private async checkForInsights(userId: string): Promise<void> {
    const insights = await this.aiCoachService.generateInsights(userId);
    
    if (insights.length > 0) {
      for (const insight of insights) {
        if (insight.type === 'spending' && insight.impact === 'high') {
          await this.notificationService.createNotification(
            userId,
            'ai_insight',
            '💡 Spending Insight',
            insight.description,
            { insight },
            'medium'
          );
        }
      }
    }
  }

  // Get transactions
  public async getTransactions(
    userId: string,
    filters: any = {},
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const query: any = { userId, ...filters };

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('goalId', 'name')
      .populate('budgetId', 'name')
      .lean();

    const total = await Transaction.countDocuments(query);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get transaction by ID
  public async getTransactionById(transactionId: string, userId: string): Promise<any> {
    const transaction = await Transaction.findOne({ _id: transactionId, userId })
      .populate('goalId')
      .populate('budgetId')
      .lean();

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  // Update transaction
  public async updateTransaction(
    transactionId: string,
    userId: string,
    updates: any
  ): Promise<any> {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Store old amount for balance adjustment
    const oldAmount = transaction.amount;

    // Update fields
    Object.assign(transaction, updates);
    await transaction.save();

    // Adjust user balance if amount changed
    if (updates.amount && updates.amount !== oldAmount) {
      const difference = updates.amount - oldAmount;
      
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.currentBalance': difference }
      });
    }

    return transaction;
  }

  // Delete transaction
  public async deleteTransaction(transactionId: string, userId: string): Promise<void> {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Reverse user balance
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'stats.currentBalance': transaction.type === 'income' ? -transaction.amount : transaction.amount,
        'stats.totalEarned': transaction.type === 'income' ? -transaction.amount : 0,
        'stats.totalSpent': transaction.type === 'expense' ? -Math.abs(transaction.amount) : 0,
        'stats.totalSaved': transaction.type === 'saving' ? -Math.abs(transaction.amount) : 0,
        'stats.totalInvested': transaction.type === 'investment' ? -Math.abs(transaction.amount) : 0
      }
    });

    // Remove from goal if linked
    if (transaction.goalId) {
      await Goal.findByIdAndUpdate(transaction.goalId, {
        $inc: { currentAmount: -Math.abs(transaction.amount) },
        $pull: {
          contributions: { transactionId: transaction._id }
        }
      });
    }

    // Remove from budget if linked
    if (transaction.budgetId) {
      await Budget.findByIdAndUpdate(transaction.budgetId, {
        $inc: { spent: -Math.abs(transaction.amount) }
      });
    }

    await transaction.deleteOne();
  }

  // Get transaction summary
  public async getSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      totalInvestments: 0,
      netCashflow: 0,
      savingsRate: 0,
      byCategory: {} as any,
      byDay: {} as any,
      byMonth: {} as any,
      largestIncome: null as any,
      largestExpense: null as any,
      averageTransaction: 0,
      transactionCount: transactions.length
    };

    for (const t of transactions) {
      const absAmount = Math.abs(t.amount);
      const dateKey = t.date.toISOString().split('T')[0];
      const monthKey = `${t.date.getFullYear()}-${t.date.getMonth() + 1}`;

      // Initialize day/month objects
      if (!summary.byDay[dateKey]) summary.byDay[dateKey] = { income: 0, expenses: 0, savings: 0 };
      if (!summary.byMonth[monthKey]) summary.byMonth[monthKey] = { income: 0, expenses: 0, savings: 0 };

      if (t.type === 'income') {
        summary.totalIncome += absAmount;
        summary.byDay[dateKey].income += absAmount;
        summary.byMonth[monthKey].income += absAmount;

        if (!summary.largestIncome || absAmount > summary.largestIncome.amount) {
          summary.largestIncome = {
            amount: absAmount,
            description: t.description,
            date: t.date
          };
        }
      } else if (t.type === 'expense') {
        summary.totalExpenses += absAmount;
        summary.byDay[dateKey].expenses += absAmount;
        summary.byMonth[monthKey].expenses += absAmount;

        if (!summary.largestExpense || absAmount > summary.largestExpense.amount) {
          summary.largestExpense = {
            amount: absAmount,
            description: t.description,
            date: t.date
          };
        }

        summary.byCategory[t.category] = (summary.byCategory[t.category] || 0) + absAmount;
      } else if (t.type === 'saving') {
        summary.totalSavings += absAmount;
        summary.byDay[dateKey].savings += absAmount;
        summary.byMonth[monthKey].savings += absAmount;
      } else if (t.type === 'investment') {
        summary.totalInvestments += absAmount;
      }
    }

    summary.netCashflow = summary.totalIncome - summary.totalExpenses;
    summary.savingsRate = summary.totalIncome > 0 
      ? (summary.totalSavings / summary.totalIncome) * 100 
      : 0;
    summary.averageTransaction = summary.transactionCount > 0
      ? (summary.totalIncome + summary.totalExpenses + summary.totalSavings) / summary.transactionCount
      : 0;

    // Sort categories by amount
    summary.byCategory = Object.entries(summary.byCategory)
      .sort(([, a]: any, [, b]: any) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    return summary;
  }

  // Get spending by category
  public async getSpendingByCategory(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const transactions = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate }
    });

    const categories: any = {};
    let total = 0;

    for (const t of transactions) {
      const amount = Math.abs(t.amount);
      categories[t.category] = (categories[t.category] || 0) + amount;
      total += amount;
    }

    // Calculate percentages
    const result = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount as number / total) * 100 : 0
    }));

    return {
      categories: result.sort((a, b) => b.amount - a.amount),
      total
    };
  }

  // Get income vs expenses trend
  public async getTrend(
    userId: string,
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'month'
  ): Promise<any> {
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const trend: any = {};

    for (const t of transactions) {
      let key;
      if (interval === 'day') {
        key = t.date.toISOString().split('T')[0];
      } else if (interval === 'week') {
        const week = Math.ceil(t.date.getDate() / 7);
        key = `${t.date.getFullYear()}-W${week}`;
      } else {
        key = `${t.date.getFullYear()}-${t.date.getMonth() + 1}`;
      }

      if (!trend[key]) {
        trend[key] = { income: 0, expenses: 0, savings: 0 };
      }

      const absAmount = Math.abs(t.amount);

      if (t.type === 'income') {
        trend[key].income += absAmount;
      } else if (t.type === 'expense') {
        trend[key].expenses += absAmount;
      } else if (t.type === 'saving') {
        trend[key].savings += absAmount;
      }
    }

    return Object.entries(trend).map(([period, data]) => ({
      period,
      ...(data as any)
    }));
  }

  // Get recurring transactions
  public async getRecurringTransactions(userId: string): Promise<any> {
    const transactions = await Transaction.find({
      userId,
      isRecurring: true
    }).sort({ date: -1 });

    // Group by pattern
    const recurring: any = {};

    for (const t of transactions) {
      const key = `${t.description}-${t.amount}`;
      
      if (!recurring[key]) {
        recurring[key] = {
          description: t.description,
          amount: t.amount,
          category: t.category,
          pattern: t.recurringPattern,
          occurrences: [],
          total: 0
        };
      }

      recurring[key].occurrences.push({
        date: t.date,
        _id: t._id
      });
      recurring[key].total += Math.abs(t.amount);
    }

    return Object.values(recurring);
  }

  // Get upcoming recurring transactions
  public async getUpcomingRecurring(userId: string, days: number = 30): Promise<any> {
    const recurring = await this.getRecurringTransactions(userId);
    const now = new Date();
    const upcoming = [];

    for (const item of recurring) {
      const lastOccurrence = item.occurrences[0]?.date;
      
      if (lastOccurrence) {
        let nextDate = new Date(lastOccurrence);

        if (item.pattern === 'daily') {
          nextDate.setDate(nextDate.getDate() + 1);
        } else if (item.pattern === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (item.pattern === 'biweekly') {
          nextDate.setDate(nextDate.getDate() + 14);
        } else if (item.pattern === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (item.pattern === 'quarterly') {
          nextDate.setMonth(nextDate.getMonth() + 3);
        } else if (item.pattern === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil <= days && daysUntil > 0) {
          upcoming.push({
            ...item,
            nextDate,
            daysUntil
          });
        }
      }
    }

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  }

  // Search transactions
  public async searchTransactions(
    userId: string,
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const searchQuery = {
      userId,
      $or: [
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } },
        { mpesaCode: { $regex: query, $options: 'i' } }
      ]
    };

    const transactions = await Transaction.find(searchQuery)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments(searchQuery);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Export transactions
  public async exportTransactions(
    userId: string,
    format: 'csv' | 'json' | 'pdf',
    filters: any = {}
  ): Promise<any> {
    const query: any = { userId, ...filters };

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .lean();

    if (format === 'json') {
      return JSON.stringify(transactions, null, 2);
    }

    if (format === 'csv') {
      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'MPESA Code', 'Notes'];
      const rows = transactions.map(t => [
        t.date.toISOString().split('T')[0],
        t.description,
        t.category,
        t.type,
        t.amount,
        t.mpesaCode || '',
        t.notes || ''
      ]);

      return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    }

    // PDF export would go here
    return transactions;
  }

  // Bulk create transactions
  public async bulkCreate(
    userId: string,
    transactions: any[],
    session?: mongoose.ClientSession
  ): Promise<any> {
    const results = [];

    for (const data of transactions) {
      const transaction = await this.createTransaction(userId, data, session);
      results.push(transaction);
    }

    return results;
  }

  // Get duplicate transactions
  public async getDuplicates(userId: string): Promise<any> {
    const transactions = await Transaction.find({ userId }).lean();

    const groups: any = {};

    for (const t of transactions) {
      const key = `${t.amount}-${t.description}-${t.date.toISOString().split('T')[0]}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(t);
    }

    const duplicates = Object.values(groups).filter((group: any) => group.length > 1);

    return duplicates;
  }

  // Merge duplicate transactions
  public async mergeDuplicates(userId: string, transactionIds: string[]): Promise<any> {
    const transactions = await Transaction.find({
      _id: { $in: transactionIds },
      userId
    });

    if (transactions.length < 2) {
      throw new AppError('Need at least 2 transactions to merge', 400);
    }

    // Use the first transaction as base
    const base = transactions[0];
    const toMerge = transactions.slice(1);

    // Sum amounts
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Combine notes
    const notes = transactions.map(t => t.notes).filter(Boolean).join('; ');

    // Update base transaction
    base.amount = totalAmount;
    base.notes = notes;
    base.metadata = {
      ...base.metadata,
      merged: transactionIds
    };

    await base.save();

    // Delete other transactions
    for (const t of toMerge) {
      await t.deleteOne();
    }

    return base;
  }
}
