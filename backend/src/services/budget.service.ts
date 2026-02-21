import { Budget } from '@/models/Budget.model';
import { Transaction } from '@/models/Transaction.model';
import { User } from '@/models/User.model';
import { NotificationService } from './notification.service';
import { AppError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

export class BudgetService {
  private static instance: BudgetService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): BudgetService {
    if (!BudgetService.instance) {
      BudgetService.instance = new BudgetService();
    }
    return BudgetService.instance;
  }

  // Create budget
  public async createBudget(userId: string, budgetData: any): Promise<any> {
    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      userId,
      category: budgetData.category,
      period: budgetData.period,
      status: 'active'
    });

    if (existingBudget) {
      throw new AppError(`Active budget already exists for ${budgetData.category}`, 400);
    }

    const budget = await Budget.create({
      userId,
      ...budgetData,
      spent: 0,
      status: 'active'
    });

    return budget;
  }

  // Get budgets
  public async getBudgets(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const query: any = { userId };
    
    if (status) {
      query.status = status;
    }

    const budgets = await Budget.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Budget.countDocuments(query);

    return {
      budgets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get budget by ID
  public async getBudgetById(budgetId: string, userId: string): Promise<any> {
    const budget = await Budget.findOne({ _id: budgetId, userId }).lean();

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    // Get recent transactions for this budget
    const transactions = await Transaction.find({
      userId,
      category: budget.category,
      date: { $gte: budget.startDate }
    })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    return {
      ...budget,
      recentTransactions: transactions
    };
  }

  // Update budget
  public async updateBudget(budgetId: string, userId: string, updates: any): Promise<any> {
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    Object.assign(budget, updates);
    await budget.save();

    return budget;
  }

  // Delete budget
  public async deleteBudget(budgetId: string, userId: string): Promise<void> {
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    await budget.deleteOne();
  }

  // Pause budget
  public async pauseBudget(budgetId: string, userId: string): Promise<any> {
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    budget.status = 'paused';
    await budget.save();

    return budget;
  }

  // Resume budget
  public async resumeBudget(budgetId: string, userId: string): Promise<any> {
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    budget.status = 'active';
    await budget.save();

    return budget;
  }

  // Add spending to budget
  public async addSpending(
    budgetId: string,
    userId: string,
    amount: number,
    transactionId?: string
  ): Promise<any> {
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    const oldPercentage = budget.percentageUsed;
    await budget.addSpending(amount, transactionId);

    // Check if alert should be sent
    if (budget.shouldSendAlert()) {
      await this.notificationService.createBudgetAlert(
        userId,
        budget,
        budget.percentageUsed
      );
    }

    // Check for milestones
    if (Math.floor(budget.percentageUsed / 10) > Math.floor(oldPercentage / 10)) {
      // Every 10% milestone
      await this.notificationService.createNotification(
        userId,
        'budget_alert',
        '📊 Budget Milestone',
        `You've used ${Math.floor(budget.percentageUsed / 10) * 10}% of your ${budget.name} budget`,
        { budgetId: budget._id, percentage: budget.percentageUsed },
        'low'
      );
    }

    return budget;
  }

  // Reset budget
  public async resetBudget(budgetId: string, userId: string): Promise<any> {
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    await budget.resetForNewPeriod();

    return budget;
  }

  // Get budget insights
  public async getBudgetInsights(userId: string): Promise<any> {
    const budgets = await Budget.find({ userId, status: 'active' });

    const insights = {
      totalBudgets: budgets.length,
      totalBudgeted: 0,
      totalSpent: 0,
      averageUsage: 0,
      onTrack: 0,
      atRisk: 0,
      exceeded: 0,
      byCategory: {} as any,
      recommendations: [] as any[]
    };

    for (const budget of budgets) {
      insights.totalBudgeted += budget.amount;
      insights.totalSpent += budget.spent;

      if (budget.isOverBudget) {
        insights.exceeded++;
        insights.recommendations.push({
          type: 'warning',
          category: budget.category,
          message: `You've exceeded your ${budget.name} budget by KES ${(budget.spent - budget.amount).toLocaleString()}`,
          action: 'Review your spending in this category'
        });
      } else if (budget.percentageUsed > 80) {
        insights.atRisk++;
        insights.recommendations.push({
          type: 'alert',
          category: budget.category,
          message: `You've used ${budget.percentageUsed.toFixed(1)}% of your ${budget.name} budget`,
          action: `Only KES ${budget.remaining.toLocaleString()} left for the ${budget.period}`
        });
      } else {
        insights.onTrack++;
      }

      insights.byCategory[budget.category] = {
        budgeted: budget.amount,
        spent: budget.spent,
        remaining: budget.remaining,
        percentageUsed: budget.percentageUsed
      };
    }

    insights.averageUsage = budgets.length > 0
      ? budgets.reduce((sum, b) => sum + b.percentageUsed, 0) / budgets.length
      : 0;

    return insights;
  }

  // Get spending by category for period
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

    const spending: any = {};

    for (const t of transactions) {
      const amount = Math.abs(t.amount);
      spending[t.category] = (spending[t.category] || 0) + amount;
    }

    return spending;
  }

  // Get budget performance
  public async getBudgetPerformance(
    userId: string,
    months: number = 6
  ): Promise<any> {
    const performance = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const budgets = await Budget.find({
        userId,
        startDate: { $lte: endDate },
        $or: [
          { endDate: { $gte: startDate } },
          { endDate: null }
        ]
      });

      const monthData: any = {
        month: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        budgeted: 0,
        actual: 0,
        byCategory: {}
      };

      for (const budget of budgets) {
        monthData.budgeted += budget.amount;

        const spending = await Transaction.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              category: budget.category,
              type: 'expense',
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $abs: '$amount' } }
            }
          }
        ]);

        const actual = spending[0]?.total || 0;
        monthData.actual += actual;
        monthData.byCategory[budget.category] = {
          budgeted: budget.amount,
          actual,
          variance: budget.amount - actual
        };
      }

      performance.push(monthData);
    }

    return performance.reverse();
  }

  // Get budget recommendations
  public async getRecommendations(userId: string): Promise<any[]> {
    const budgets = await Budget.find({ userId, status: 'active' });
    const recommendations = [];

    for (const budget of budgets) {
      if (budget.isOverBudget) {
        // Suggest increasing budget or reducing spending
        const avgSpending = await this.getAverageSpending(userId, budget.category, 3);
        
        recommendations.push({
          type: 'adjust',
          category: budget.category,
          currentBudget: budget.amount,
          averageSpending: avgSpending,
          suggestedBudget: Math.ceil(avgSpending / 100) * 100,
          reason: `You've exceeded your budget for ${budget.category} in the current period. Based on your average spending, consider adjusting your budget to KES ${Math.ceil(avgSpending / 100) * 100}.`
        });
      } else if (budget.percentageUsed < 50 && budget.remaining > budget.amount * 0.3) {
        // Suggest reducing budget
        recommendations.push({
          type: 'reduce',
          category: budget.category,
          currentBudget: budget.amount,
          suggestedBudget: Math.ceil(budget.spent * 1.2 / 100) * 100,
          reason: `You're consistently under-spending in ${budget.category}. You could reduce your budget and allocate the difference to savings or investments.`
        });
      }
    }

    // Check for missing budgets
    const existingCategories = budgets.map(b => b.category);
    const commonCategories = ['food', 'transport', 'entertainment', 'utilities', 'shopping'];
    
    for (const category of commonCategories) {
      if (!existingCategories.includes(category)) {
        const avgSpending = await this.getAverageSpending(userId, category, 3);
        
        if (avgSpending > 0) {
          recommendations.push({
            type: 'create',
            category,
            suggestedBudget: Math.ceil(avgSpending * 1.1 / 100) * 100,
            reason: `You don't have a budget for ${category}, but you spend an average of KES ${avgSpending.toLocaleString()} monthly. Consider creating a budget to track this spending.`
          });
        }
      }
    }

    return recommendations;
  }

  // Get average spending for category
  private async getAverageSpending(
    userId: string,
    category: string,
    months: number = 3
  ): Promise<number> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category,
          type: 'expense',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: { $abs: '$amount' } }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$total' }
        }
      }
    ]);

    return result[0]?.average || 0;
  }

  // Process budget resets
  public async processBudgetResets(): Promise<void> {
    const budgetsNeedingReset = await Budget.getBudgetsNeedingReset();

    for (const budget of budgetsNeedingReset) {
      await budget.resetForNewPeriod();

      // Send notification
      await this.notificationService.createNotification(
        budget.userId.toString(),
        'budget_alert',
        '🔄 Budget Reset',
        `Your ${budget.name} budget has been reset for the new ${budget.period} period.`,
        { budgetId: budget._id },
        'low'
      );
    }
  }

  // Check budget alerts
  public async checkBudgetAlerts(): Promise<void> {
    const budgets = await Budget.find({ status: 'active', alerts: true });

    for (const budget of budgets) {
      if (budget.shouldSendAlert()) {
        await this.notificationService.createBudgetAlert(
          budget.userId.toString(),
          budget,
          budget.percentageUsed
        );
      }
    }
  }

  // Clone budget
  public async cloneBudget(budgetId: string, userId: string): Promise<any> {
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    const clonedData = budget.toObject();
    delete clonedData._id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    delete clonedData.spent;
    delete clonedData.alertsSent;

    clonedData.name = `${clonedData.name} (Copy)`;
    clonedData.startDate = new Date();
    
    if (clonedData.period === 'monthly') {
      clonedData.endDate = new Date(
        clonedData.startDate.getFullYear(),
        clonedData.startDate.getMonth() + 1,
        0
      );
    } else if (clonedData.period === 'weekly') {
      const endOfWeek = new Date(clonedData.startDate);
      endOfWeek.setDate(clonedData.startDate.getDate() + (7 - clonedData.startDate.getDay()));
      clonedData.endDate = endOfWeek;
    }

    const newBudget = await Budget.create(clonedData);

    return newBudget;
  }

  // Get budget history
  public async getBudgetHistory(
    budgetId: string,
    userId: string,
    months: number = 12
  ): Promise<any> {
    const budget = await Budget.findOne({ _id: budgetId, userId });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    const history = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const spending = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            category: budget.category,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: '$amount' } }
          }
        }
      ]);

      history.push({
        period: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        budgeted: budget.amount,
        actual: spending[0]?.total || 0,
        variance: budget.amount - (spending[0]?.total || 0),
        percentageUsed: budget.amount > 0 
          ? ((spending[0]?.total || 0) / budget.amount) * 100 
          : 0
      });
    }

    return history.reverse();
  }
}
