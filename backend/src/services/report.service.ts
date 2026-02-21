import { User } from '@/models/User.model';
import { Transaction } from '@/models/Transaction.model';
import { Goal } from '@/models/Goal.model';
import { Budget } from '@/models/Budget.model';
import { Investment } from '@/models/Investment.model';
import { Challenge, UserChallenge } from '@/models/Challenge.model';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';
import { AnalyticsService } from './analytics.service';
import { RedisService } from './redis.service';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';

export class ReportService {
  private static instance: ReportService;
  private notificationService: NotificationService;
  private emailService: EmailService;
  private smsService: SMSService;
  private analyticsService: AnalyticsService;
  private redisService: RedisService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.emailService = EmailService.getInstance();
    this.smsService = SMSService.getInstance();
    this.analyticsService = AnalyticsService.getInstance();
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  // Generate daily report
  public async generateDailyReport(userId: string): Promise<any> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const [transactions, goals, budgets] = await Promise.all([
      Transaction.find({
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }),
      Goal.find({ userId, status: 'active' }),
      Budget.find({ userId, status: 'active' })
    ]);

    const dailyReport = {
      date: startOfDay,
      summary: {
        income: 0,
        expenses: 0,
        savings: 0,
        transactions: transactions.length
      },
      transactions: transactions.map(t => ({
        amount: t.amount,
        description: t.description,
        category: t.category,
        type: t.type,
        time: t.date.toLocaleTimeString()
      })),
      goals: goals.map(g => ({
        name: g.name,
        progress: g.progress,
        remaining: g.remainingAmount
      })),
      budgets: budgets.map(b => ({
        name: b.name,
        spent: b.spent,
        remaining: b.remaining,
        percentage: b.percentageUsed
      })),
      insights: []
    };

    // Calculate totals
    for (const t of transactions) {
      if (t.type === 'income') {
        dailyReport.summary.income += t.amount;
      } else if (t.type === 'expense') {
        dailyReport.summary.expenses += Math.abs(t.amount);
      } else if (t.type === 'saving') {
        dailyReport.summary.savings += t.amount;
      }
    }

    // Generate insights
    if (dailyReport.summary.expenses > dailyReport.summary.income * 0.5) {
      dailyReport.insights.push({
        type: 'warning',
        message: 'You spent over 50% of your income today. Consider reviewing your expenses.'
      });
    }

    if (dailyReport.summary.savings > 0) {
      dailyReport.insights.push({
        type: 'success',
        message: `Great job! You saved KES ${dailyReport.summary.savings.toLocaleString()} today.`
      });
    }

    return dailyReport;
  }

  // Generate weekly report
  public async generateWeeklyReport(userId: string): Promise<any> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const [dashboard, spending, income, savings] = await Promise.all([
      this.analyticsService.getUserDashboard(userId),
      this.analyticsService.getSpendingAnalysis(userId, startOfWeek, now),
      this.analyticsService.getIncomeAnalysis(userId, startOfWeek, now),
      this.analyticsService.getSavingsAnalysis(userId, startOfWeek, now)
    ]);

    const weeklyReport = {
      period: {
        start: startOfWeek,
        end: now
      },
      summary: {
        income: income.total,
        expenses: spending.total,
        savings: savings.total,
        netWorth: dashboard.monthly.netWorth,
        savingsRate: savings.rate
      },
      spending: {
        byCategory: spending.byCategory,
        largest: spending.largestTransactions,
        averagePerDay: spending.averagePerDay
      },
      income: {
        bySource: income.bySource,
        largest: income.largestIncomes,
        recurring: income.recurring
      },
      savings: {
        byMethod: savings.byMethod,
        towardsGoals: savings.towardsGoals,
        projectedAnnual: savings.projectedSavings
      },
      goals: dashboard.goals,
      budgets: dashboard.budgets,
      investments: dashboard.investments,
      challenges: dashboard.challenges,
      achievements: dashboard.achievements,
      insights: [],
      recommendations: []
    };

    // Generate insights
    if (savings.rate < 20) {
      weeklyReport.insights.push({
        type: 'warning',
        message: `Your savings rate is ${savings.rate.toFixed(1)}%. Aim for at least 20%.`
      });
    }

    const topCategory = Object.entries(spending.byCategory)
      .sort(([, a]: any, [, b]: any) => b - a)[0];
    
    if (topCategory) {
      weeklyReport.insights.push({
        type: 'info',
        message: `Your top spending category this week was ${topCategory[0]} at KES ${(topCategory[1] as number).toLocaleString()}.`
      });
    }

    // Generate recommendations
    if (spending.total > income.total * 0.7) {
      weeklyReport.recommendations.push({
        type: 'budget',
        message: 'Consider creating a budget to manage your spending.',
        action: 'Create Budget'
      });
    }

    return weeklyReport;
  }

  // Generate monthly report
  public async generateMonthlyReport(userId: string): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [weekly, health, recommendations, timeline] = await Promise.all([
      this.generateWeeklyReport(userId),
      this.analyticsService.getFinancialHealthScore(userId),
      this.analyticsService.getRecommendations(userId),
      this.analyticsService.getNetWorthTimeline(userId, 12)
    ]);

    const monthlyReport = {
      ...weekly,
      period: {
        start: startOfMonth,
        end: endOfMonth
      },
      health: health,
      recommendations: recommendations,
      netWorthTimeline: timeline,
      comparison: {
        vsLastMonth: await this.compareWithPreviousMonth(userId),
        vsTarget: await this.compareWithTargets(userId)
      },
      achievements: await this.getMonthlyAchievements(userId),
      projections: await this.generateProjections(userId)
    };

    return monthlyReport;
  }

  // Generate annual report
  public async generateAnnualReport(userId: string, year: number): Promise<any> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    const [transactions, goals, investments, challenges] = await Promise.all([
      Transaction.find({
        userId,
        date: { $gte: startOfYear, $lte: endOfYear }
      }),
      Goal.find({
        userId,
        createdAt: { $lte: endOfYear }
      }),
      Investment.find({
        userId,
        createdAt: { $lte: endOfYear }
      }),
      UserChallenge.find({
        userId,
        createdAt: { $lte: endOfYear }
      }).populate('challengeId')
    ]);

    const annualReport = {
      year,
      summary: {
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        totalInvested: 0,
        netWorthChange: 0
      },
      monthly: [],
      categories: {} as any,
      goals: {
        completed: 0,
        inProgress: 0,
        totalTarget: 0,
        totalSaved: 0
      },
      investments: {
        totalReturns: 0,
        averageReturn: 0,
        byType: {} as any
      },
      challenges: {
        completed: 0,
        attempted: 0,
        badges: []
      },
      milestones: [],
      highlights: [],
      improvements: []
    };

    // Process transactions
    const monthlyData: any = {};

    for (const t of transactions) {
      const month = t.date.getMonth();
      const amount = Math.abs(t.amount);

      if (!monthlyData[month]) {
        monthlyData[month] = {
          income: 0,
          expenses: 0,
          savings: 0
        };
      }

      if (t.type === 'income') {
        annualReport.summary.totalIncome += amount;
        monthlyData[month].income += amount;
      } else if (t.type === 'expense') {
        annualReport.summary.totalExpenses += amount;
        monthlyData[month].expenses += amount;
        annualReport.categories[t.category] = (annualReport.categories[t.category] || 0) + amount;
      } else if (t.type === 'saving') {
        annualReport.summary.totalSavings += amount;
        monthlyData[month].savings += amount;
      } else if (t.type === 'investment') {
        annualReport.summary.totalInvested += amount;
      }
    }

    // Format monthly data
    annualReport.monthly = Object.entries(monthlyData).map(([month, data]) => ({
      month: new Date(year, parseInt(month), 1).toLocaleString('default', { month: 'long' }),
      ...(data as any)
    }));

    // Process goals
    for (const goal of goals) {
      if (goal.completed && goal.completedDate && goal.completedDate.getFullYear() === year) {
        annualReport.goals.completed++;
        annualReport.milestones.push({
          type: 'goal',
          name: goal.name,
          date: goal.completedDate,
          amount: goal.targetAmount
        });
      } else if (goal.status === 'active') {
        annualReport.goals.inProgress++;
      }
      annualReport.goals.totalTarget += goal.targetAmount;
      annualReport.goals.totalSaved += goal.currentAmount;
    }

    // Process investments
    for (const inv of investments) {
      annualReport.investments.totalReturns += inv.returns;
      annualReport.investments.byType[inv.type] = (annualReport.investments.byType[inv.type] || 0) + inv.returns;
    }
    annualReport.investments.averageReturn = annualReport.summary.totalInvested > 0
      ? (annualReport.investments.totalReturns / annualReport.summary.totalInvested) * 100
      : 0;

    // Process challenges
    for (const uc of challenges) {
      annualReport.challenges.attempted++;
      if (uc.completed) {
        annualReport.challenges.completed++;
        annualReport.challenges.badges.push((uc.challengeId as any).badge);
        annualReport.milestones.push({
          type: 'challenge',
          name: (uc.challengeId as any).name,
          date: uc.completedDate,
          badge: (uc.challengeId as any).badge.icon
        });
      }
    }

    // Calculate net worth change
    const startOfYearBalance = await this.getBalanceAtDate(userId, startOfYear);
    const endOfYearBalance = await this.getBalanceAtDate(userId, endOfYear);
    annualReport.summary.netWorthChange = endOfYearBalance - startOfYearBalance;

    // Identify highlights and improvements
    if (annualReport.summary.totalSavings > 0) {
      annualReport.highlights.push(`Saved KES ${annualReport.summary.totalSavings.toLocaleString()} this year!`);
    }

    if (annualReport.goals.completed > 0) {
      annualReport.highlights.push(`Achieved ${annualReport.goals.completed} financial goals!`);
    }

    if (annualReport.challenges.completed > 0) {
      annualReport.highlights.push(`Earned ${annualReport.challenges.completed} achievement badges!`);
    }

    const topCategory = Object.entries(annualReport.categories)
      .sort(([, a]: any, [, b]: any) => b - a)[0];
    
    if (topCategory) {
      annualReport.improvements.push(`Your top spending category was ${topCategory[0]} at KES ${(topCategory[1] as number).toLocaleString()}. Consider reviewing this expense.`);
    }

    if (annualReport.summary.totalSavings < annualReport.summary.totalIncome * 0.1) {
      annualReport.improvements.push('Your savings rate is below 10%. Try to increase it next year.');
    }

    return annualReport;
  }

  // Compare with previous month
  private async compareWithPreviousMonth(userId: string): Promise<any> {
    const now = new Date();
    const thisMonth = {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    };
    const lastMonth = {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0)
    };

    const [thisMonthData, lastMonthData] = await Promise.all([
      this.generateMonthlyReport(userId),
      this.generateMonthlyReport(userId) // This would need to be for last month
    ]);

    // This is simplified - in production, you'd fetch actual data for last month
    return {
      income: { current: thisMonthData.summary.income, previous: lastMonthData.summary.income },
      expenses: { current: thisMonthData.summary.expenses, previous: lastMonthData.summary.expenses },
      savings: { current: thisMonthData.summary.savings, previous: lastMonthData.summary.savings }
    };
  }

  // Compare with targets
  private async compareWithTargets(userId: string): Promise<any> {
    const user = await User.findById(userId);
    const monthlyIncome = user?.stats.totalEarned / 12 || 0;

    return {
      savings: {
        target: monthlyIncome * 0.2,
        actual: user?.stats.totalSaved / 12 || 0
      },
      expenses: {
        target: monthlyIncome * 0.5,
        actual: user?.stats.totalSpent / 12 || 0
      }
    };
  }

  // Get monthly achievements
  private async getMonthlyAchievements(userId: string): Promise<any[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [goals, challenges] = await Promise.all([
      Goal.find({
        userId,
        completedDate: { $gte: startOfMonth }
      }),
      UserChallenge.find({
        userId,
        completedDate: { $gte: startOfMonth }
      }).populate('challengeId')
    ]);

    const achievements = [];

    for (const goal of goals) {
      achievements.push({
        type: 'goal',
        name: goal.name,
        date: goal.completedDate,
        icon: '🎯'
      });
    }

    for (const uc of challenges) {
      if (uc.completed) {
        achievements.push({
          type: 'challenge',
          name: (uc.challengeId as any).name,
          date: uc.completedDate,
          icon: (uc.challengeId as any).badge.icon
        });
      }
    }

    return achievements.sort((a, b) => b.date - a.date);
  }

  // Generate projections
  private async generateProjections(userId: string): Promise<any> {
    const user = await User.findById(userId);
    const monthlyIncome = user?.stats.totalEarned / 12 || 0;
    const monthlySavings = user?.stats.totalSaved / 12 || 0;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    const projections = [];

    for (let i = 1; i <= 5; i++) {
      const projectedSavings = monthlySavings * 12 * i * (1 + 0.08); // Assuming 8% returns
      projections.push({
        year: new Date().getFullYear() + i,
        savings: projectedSavings,
        monthlyIncome: monthlyIncome * (1 + 0.03) ** i, // 3% annual increase
        netWorth: projectedSavings + (user?.stats.currentBalance || 0)
      });
    }

    return projections;
  }

  // Get balance at specific date
  private async getBalanceAtDate(userId: string, date: Date): Promise<number> {
    const transactions = await Transaction.find({
      userId,
      date: { $lte: date }
    });

    let balance = 0;
    for (const t of transactions) {
      if (t.type === 'income') {
        balance += t.amount;
      } else if (t.type === 'expense' || t.type === 'saving' || t.type === 'investment') {
        balance -= Math.abs(t.amount);
      }
    }

    return balance;
  }

  // Export report as PDF
  public async exportToPDF(report: any, type: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add header
      doc.fontSize(20).font('Helvetica-Bold').text('The Base Financial Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();
      doc.moveDown();

      // Add summary
      doc.fontSize(16).font('Helvetica-Bold').text('Summary');
      doc.moveDown();

      if (report.summary) {
        doc.fontSize(12).font('Helvetica').text(`Income: KES ${report.summary.income?.toLocaleString() || 0}`);
        doc.text(`Expenses: KES ${report.summary.expenses?.toLocaleString() || 0}`);
        doc.text(`Savings: KES ${report.summary.savings?.toLocaleString() || 0}`);
        doc.text(`Savings Rate: ${report.summary.savingsRate?.toFixed(1) || 0}%`);
      }
      doc.moveDown();

      // Add spending by category
      if (report.spending?.byCategory) {
        doc.fontSize(16).font('Helvetica-Bold').text('Spending by Category');
        doc.moveDown();
        
        for (const [category, amount] of Object.entries(report.spending.byCategory)) {
          doc.fontSize(12).font('Helvetica').text(`${category}: KES ${(amount as number).toLocaleString()}`);
        }
        doc.moveDown();
      }

      // Add insights
      if (report.insights?.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Insights');
        doc.moveDown();
        
        for (const insight of report.insights) {
          doc.fontSize(12).font('Helvetica').text(`• ${insight.message}`);
        }
      }

      doc.end();
    });
  }

  // Export report as Excel
  public async exportToExcel(report: any, type: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    
    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    if (report.summary) {
      summarySheet.addRow({ metric: 'Income', value: report.summary.income });
      summarySheet.addRow({ metric: 'Expenses', value: report.summary.expenses });
      summarySheet.addRow({ metric: 'Savings', value: report.summary.savings });
      summarySheet.addRow({ metric: 'Savings Rate (%)', value: report.summary.savingsRate });
    }

    // Categories sheet
    if (report.spending?.byCategory) {
      const categoriesSheet = workbook.addWorksheet('Spending by Category');
      categoriesSheet.columns = [
        { header: 'Category', key: 'category', width: 30 },
        { header: 'Amount', key: 'amount', width: 20 }
      ];

      for (const [category, amount] of Object.entries(report.spending.byCategory)) {
        categoriesSheet.addRow({ category, amount });
      }
    }

    // Insights sheet
    if (report.insights?.length > 0) {
      const insightsSheet = workbook.addWorksheet('Insights');
      insightsSheet.columns = [
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Message', key: 'message', width: 50 }
      ];

      for (const insight of report.insights) {
        insightsSheet.addRow({ type: insight.type, message: insight.message });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // Send daily reports to all users
  public async sendDailyReports(): Promise<void> {
    const users = await User.find({
      'preferences.notifications.dailySummary': true
    });

    for (const user of users) {
      try {
        const report = await this.generateDailyReport(user.id);
        
        // Send email
        await this.emailService.sendWeeklyReport(
          user.email,
          user.firstName,
          report.summary
        );

        // Send SMS if enabled
        if (user.preferences.notifications.sms) {
          await this.smsService.sendWeeklySummary(
            user.phoneNumber,
            report.summary
          );
        }

        // Store in Redis for quick access
        await this.redisService.set(
          `report:daily:${user.id}`,
          JSON.stringify(report),
          86400 // 24 hours
        );
      } catch (error) {
        console.error(`Failed to send daily report to user ${user.id}:`, error);
      }
    }
  }

  // Send weekly reports
  public async sendWeeklyReports(): Promise<void> {
    const users = await User.find({
      'preferences.notifications.weeklyReport': true
    });

    for (const user of users) {
      try {
        const report = await this.generateWeeklyReport(user.id);
        
        await this.emailService.sendWeeklyReport(
          user.email,
          user.firstName,
          report.summary
        );

        await this.redisService.set(
          `report:weekly:${user.id}`,
          JSON.stringify(report),
          604800 // 7 days
        );

        // Create notification
        await this.notificationService.createWeeklyReport(user.id, report.summary);
      } catch (error) {
        console.error(`Failed to send weekly report to user ${user.id}:`, error);
      }
    }
  }

  // Send monthly reports
  public async sendMonthlyReports(): Promise<void> {
    const users = await User.find({
      'preferences.notifications.monthlyReport': true
    });

    for (const user of users) {
      try {
        const report = await this.generateMonthlyReport(user.id);
        
        // Send email with PDF attachment
        const pdfBuffer = await this.exportToPDF(report, 'monthly');
        
        // In production, you'd attach the PDF to the email
        await this.emailService.sendWeeklyReport(
          user.email,
          user.firstName,
          report.summary
        );

        await this.redisService.set(
          `report:monthly:${user.id}`,
          JSON.stringify(report),
          2592000 // 30 days
        );
      } catch (error) {
        console.error(`Failed to send monthly report to user ${user.id}:`, error);
      }
    }
  }
}
