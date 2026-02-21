import { Goal } from '@/models/Goal.model';
import { User } from '@/models/User.model';
import { Transaction } from '@/models/Transaction.model';
import { NotificationService } from './notification.service';
import { AppError } from '@/middleware/errorHandler';
import mongoose from 'mongoose';

export class GoalService {
  private static instance: GoalService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): GoalService {
    if (!GoalService.instance) {
      GoalService.instance = new GoalService();
    }
    return GoalService.instance;
  }

  // Create goal
  public async createGoal(userId: string, goalData: any): Promise<any> {
    const goal = await Goal.create({
      userId,
      ...goalData,
      progress: 0,
      status: 'active'
    });

    return goal;
  }

  // Get goals
  public async getGoals(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const query: any = { userId };
    
    if (status) {
      query.status = status;
    }

    const goals = await Goal.find(query)
      .sort({ priority: -1, deadline: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Goal.countDocuments(query);

    // Calculate projected completion
    for (const goal of goals) {
      goal.projectedCompletion = await this.calculateProjectedCompletion(goal._id);
    }

    return {
      goals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get goal by ID
  public async getGoalById(goalId: string, userId: string): Promise<any> {
    const goal = await Goal.findOne({ _id: goalId, userId })
      .populate('contributions.transactionId')
      .lean();

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    goal.projectedCompletion = await this.calculateProjectedCompletion(goalId);

    return goal;
  }

  // Update goal
  public async updateGoal(goalId: string, userId: string, updates: any): Promise<any> {
    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.completed) {
      throw new AppError('Cannot update completed goal', 400);
    }

    Object.assign(goal, updates);
    await goal.save();

    return goal;
  }

  // Delete goal
  public async deleteGoal(goalId: string, userId: string): Promise<void> {
    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    await goal.deleteOne();
  }

  // Add contribution
  public async addContribution(
    goalId: string,
    userId: string,
    amount: number,
    type: 'manual' | 'auto' | 'roundup' | 'bonus' = 'manual',
    transactionId?: string,
    note?: string
  ): Promise<any> {
    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.completed) {
      throw new AppError('Goal already completed', 400);
    }

    const oldProgress = goal.progress;
    await goal.addContribution(amount, type, transactionId, note);

    // Check if milestone achieved
    const achievedMilestones = goal.checkMilestones();

    // Send notifications
    if (goal.progress >= 100) {
      await this.notificationService.createGoalProgress(userId, goal, 100);
    } else if (Math.floor(goal.progress / 10) > Math.floor(oldProgress / 10)) {
      // Notify every 10% progress
      await this.notificationService.createGoalProgress(userId, goal, goal.progress);
    }

    for (const milestone of achievedMilestones) {
      await this.notificationService.createAchievementUnlocked(userId, {
        name: milestone.name,
        description: `Achieved milestone in ${goal.name}`,
        icon: '🎯'
      });
    }

    return goal;
  }

  // Calculate projected completion
  private async calculateProjectedCompletion(goalId: string): Promise<Date | null> {
    const goal = await Goal.findById(goalId);

    if (!goal || goal.completed || goal.progress === 0) {
      return null;
    }

    const daysSinceStart = Math.floor((Date.now() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const progressPerDay = goal.progress / daysSinceStart;
    const daysToCompletion = (100 - goal.progress) / progressPerDay;

    return new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000);
  }

  // Get goal insights
  public async getGoalInsights(userId: string): Promise<any> {
    const goals = await Goal.find({ userId });

    const insights = {
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.completed).length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      totalTarget: 0,
      totalSaved: 0,
      averageProgress: 0,
      onTrackGoals: 0,
      atRiskGoals: 0,
      byCategory: {} as any,
      byPriority: {} as any,
      upcomingDeadlines: [] as any[],
      projectedCompletion: {} as any
    };

    for (const goal of goals) {
      insights.totalTarget += goal.targetAmount;
      insights.totalSaved += goal.currentAmount;

      if (goal.status === 'active') {
        if (goal.isOnTrack) {
          insights.onTrackGoals++;
        } else {
          insights.atRiskGoals++;
        }

        // Upcoming deadlines (next 30 days)
        const daysUntilDeadline = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilDeadline <= 30 && daysUntilDeadline > 0) {
          insights.upcomingDeadlines.push({
            id: goal._id,
            name: goal.name,
            deadline: goal.deadline,
            daysUntil: daysUntilDeadline,
            progress: goal.progress
          });
        }

        // Projected completion
        const projected = await this.calculateProjectedCompletion(goal._id);
        if (projected) {
          insights.projectedCompletion[goal._id] = projected;
        }
      }

      insights.byCategory[goal.category] = (insights.byCategory[goal.category] || 0) + 1;
      insights.byPriority[goal.priority] = (insights.byPriority[goal.priority] || 0) + 1;
    }

    insights.averageProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
      : 0;

    insights.upcomingDeadlines.sort((a, b) => a.daysUntil - b.daysUntil);

    return insights;
  }

  // Get recommended goals
  public async getRecommendedGoals(userId: string): Promise<any[]> {
    const user = await User.findById(userId);
    const existingGoals = await Goal.find({ userId, status: 'active' });

    const recommendations = [];

    // Emergency fund (if not present)
    if (!existingGoals.some(g => g.category === 'emergency')) {
      recommendations.push({
        name: 'Emergency Fund',
        description: 'Save 3-6 months of expenses for emergencies',
        category: 'emergency',
        targetAmount: user?.stats.monthlyExpenses * 6 || 300000,
        priority: 'critical',
        reason: 'Essential financial safety net'
      });
    }

    // Retirement (if over 25 and not saving)
    if (user?.stats.age > 25 && !existingGoals.some(g => g.category === 'retirement')) {
      recommendations.push({
        name: 'Retirement Fund',
        description: 'Start saving for your golden years',
        category: 'retirement',
        targetAmount: 3000000,
        priority: 'high',
        reason: 'The earlier you start, the more you benefit from compound interest'
      });
    }

    // Investment goal
    if (user?.stats.totalSaved > 100000 && !existingGoals.some(g => g.category === 'investment')) {
      recommendations.push({
        name: 'First Investment',
        description: 'Start your investment journey',
        category: 'investment',
        targetAmount: 50000,
        priority: 'medium',
        reason: 'Put your savings to work in MMFs or Saccos'
      });
    }

    // Education fund
    if (user?.stats.age < 35 && !existingGoals.some(g => g.category === 'education')) {
      recommendations.push({
        name: 'Education Fund',
        description: 'Invest in yourself or your children',
        category: 'education',
        targetAmount: 500000,
        priority: 'medium',
        reason: 'Education is the best investment'
      });
    }

    return recommendations;
  }

  // Auto-save for goals
  public async processAutoSave(): Promise<void> {
    const goals = await Goal.find({
      autoSave: true,
      status: 'active',
      completed: false
    });

    for (const goal of goals) {
      const now = new Date();
      const lastContribution = goal.contributions[goal.contributions.length - 1];

      // Check if it's time to auto-save
      if (lastContribution) {
        const shouldSave = this.shouldAutoSave(goal.autoSaveFrequency!, lastContribution.date, now);
        
        if (shouldSave && goal.autoSaveAmount) {
          // Create transaction
          const transaction = await Transaction.create({
            userId: goal.userId,
            amount: goal.autoSaveAmount,
            type: 'saving',
            category: 'savings',
            description: `Auto-save for ${goal.name}`,
            date: now,
            goalId: goal._id,
            isRecurring: true,
            recurringPattern: goal.autoSaveFrequency,
            status: 'completed'
          });

          // Add to goal
          await goal.addContribution(
            goal.autoSaveAmount,
            'auto',
            transaction._id,
            'Auto-save contribution'
          );
        }
      }
    }
  }

  // Check if should auto-save
  private shouldAutoSave(frequency: string, lastDate: Date, now: Date): boolean {
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (frequency) {
      case 'daily':
        return diffDays >= 1;
      case 'weekly':
        return diffDays >= 7;
      case 'biweekly':
        return diffDays >= 14;
      case 'monthly':
        return diffDays >= 30;
      case 'quarterly':
        return diffDays >= 90;
      case 'yearly':
        return diffDays >= 365;
      default:
        return false;
    }
  }

  // Check for overdue goals
  public async checkOverdueGoals(): Promise<void> {
    const now = new Date();
    
    const overdueGoals = await Goal.find({
      status: 'active',
      completed: false,
      deadline: { $lt: now }
    });

    for (const goal of overdueGoals) {
      goal.status = 'overdue';
      await goal.save();

      await this.notificationService.createNotification(
        goal.userId.toString(),
        'goal_progress',
        '⚠️ Goal Overdue',
        `Your goal "${goal.name}" was due on ${goal.deadline.toLocaleDateString()}. Consider extending the deadline or adjusting your target.`,
        { goalId: goal._id },
        'high'
      );
    }
  }

  // Complete goal
  public async completeGoal(goalId: string, userId: string): Promise<any> {
    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.completed) {
      throw new AppError('Goal already completed', 400);
    }

    goal.completed = true;
    goal.completedDate = new Date();
    goal.status = 'completed';
    await goal.save();

    // Award XP
    const xpReward = Math.floor(goal.targetAmount / 1000) * 10;
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.experience': xpReward }
    });

    // Send notification
    await this.notificationService.createGoalProgress(userId, goal, 100);

    return goal;
  }

  // Extend deadline
  public async extendDeadline(
    goalId: string,
    userId: string,
    newDeadline: Date
  ): Promise<any> {
    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.completed) {
      throw new AppError('Cannot extend completed goal', 400);
    }

    goal.deadline = newDeadline;
    await goal.save();

    return goal;
  }

  // Adjust target amount
  public async adjustTarget(
    goalId: string,
    userId: string,
    newTarget: number
  ): Promise<any> {
    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (goal.completed) {
      throw new AppError('Cannot adjust completed goal', 400);
    }

    if (newTarget < goal.currentAmount) {
      throw new AppError('New target cannot be less than current amount', 400);
    }

    goal.targetAmount = newTarget;
    await goal.save();

    return goal;
  }
}
