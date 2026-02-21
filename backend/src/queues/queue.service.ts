// src/queues/queue.service.ts
import Queue from 'bull';
import { RedisService } from '@/services/redis.service';
import { EmailService } from '@/services/email.service';
import { SMSService } from '@/services/sms.service';
import { NotificationService } from '@/services/notification.service';
import { TransactionService } from '@/services/transaction.service';
import { GoalService } from '@/services/goal.service';
import { BudgetService } from '@/services/budget.service';
import { InvestmentService } from '@/services/investment.service';
import { ChallengeService } from '@/services/challenge.service';
import { ReportService } from '@/services/report.service';
import { MpesaService } from '@/services/mpesa.service';

export class QueueService {
  private static instance: QueueService;
  
  // Queues
  public emailQueue: Queue.Queue;
  public smsQueue: Queue.Queue;
  public notificationQueue: Queue.Queue;
  public transactionQueue: Queue.Queue;
  public goalQueue: Queue.Queue;
  public budgetQueue: Queue.Queue;
  public investmentQueue: Queue.Queue;
  public challengeQueue: Queue.Queue;
  public reportQueue: Queue.Queue;
  public mpesaQueue: Queue.Queue;
  public cleanupQueue: Queue.Queue;

  private constructor() {
    const redisConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      }
    };

    // Initialize queues
    this.emailQueue = new Queue('email', redisConfig);
    this.smsQueue = new Queue('sms', redisConfig);
    this.notificationQueue = new Queue('notification', redisConfig);
    this.transactionQueue = new Queue('transaction', redisConfig);
    this.goalQueue = new Queue('goal', redisConfig);
    this.budgetQueue = new Queue('budget', redisConfig);
    this.investmentQueue = new Queue('investment', redisConfig);
    this.challengeQueue = new Queue('challenge', redisConfig);
    this.reportQueue = new Queue('report', redisConfig);
    this.mpesaQueue = new Queue('mpesa', redisConfig);
    this.cleanupQueue = new Queue('cleanup', redisConfig);

    this.initializeProcessors();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private initializeProcessors() {
    // Email queue processor
    this.emailQueue.process(async (job) => {
      const { type, to, data } = job.data;
      const emailService = EmailService.getInstance();

      switch (type) {
        case 'welcome':
          await emailService.sendWelcomeEmail(to, data.name);
          break;
        case 'verification':
          await emailService.sendVerificationEmail(to, data.name, data.token);
          break;
        case 'password-reset':
          await emailService.sendPasswordResetEmail(to, data.name, data.token);
          break;
        case 'login-notification':
          await emailService.sendLoginNotification(to, data.name, data.deviceInfo);
          break;
        case 'weekly-report':
          await emailService.sendWeeklyReport(to, data.name, data.report);
          break;
        case 'monthly-report':
          await emailService.sendWeeklyReport(to, data.name, data.report);
          break;
      }

      return { success: true };
    });

    // SMS queue processor
    this.smsQueue.process(async (job) => {
      const { type, to, data } = job.data;
      const smsService = SMSService.getInstance();

      switch (type) {
        case 'verification':
          await smsService.sendVerificationCode(to, data.code);
          break;
        case 'transaction':
          await smsService.sendTransactionAlert(to, data.amount, data.type, data.description);
          break;
        case 'budget':
          await smsService.sendBudgetAlert(to, data.budgetName, data.percentage, data.spent, data.limit);
          break;
        case 'goal':
          await smsService.sendGoalProgress(to, data.goalName, data.progress, data.target, data.current);
          break;
        case 'investment':
          await smsService.sendInvestmentUpdate(to, data.investmentName, data.change, data.value);
          break;
        case 'challenge':
          await smsService.sendChallengeReminder(to, data.challengeName, data.progress, data.daysLeft);
          break;
      }

      return { success: true };
    });

    // Notification queue processor
    this.notificationQueue.process(async (job) => {
      const { userId, type, title, body, data, priority } = job.data;
      const notificationService = NotificationService.getInstance();

      await notificationService.createNotification(userId, type, title, body, data, priority);

      return { success: true };
    });

    // Transaction queue processor
    this.transactionQueue.process(async (job) => {
      const { action, userId, data } = job.data;
      const transactionService = TransactionService.getInstance();

      switch (action) {
        case 'process-roundup':
          // Process round-up savings
          break;
        case 'check-duplicates':
          await transactionService.getDuplicates(userId);
          break;
        case 'process-recurring':
          // Process recurring transactions
          break;
      }

      return { success: true };
    });

    // Goal queue processor
    this.goalQueue.process(async (job) => {
      const { action, userId, data } = job.data;
      const goalService = GoalService.getInstance();

      switch (action) {
        case 'process-autosave':
          await goalService.processAutoSave();
          break;
        case 'check-overdue':
          await goalService.checkOverdueGoals();
          break;
      }

      return { success: true };
    });

    // Budget queue processor
    this.budgetQueue.process(async (job) => {
      const { action, userId, data } = job.data;
      const budgetService = BudgetService.getInstance();

      switch (action) {
        case 'process-resets':
          await budgetService.processBudgetResets();
          break;
        case 'check-alerts':
          await budgetService.checkBudgetAlerts();
          break;
      }

      return { success: true };
    });

    // Investment queue processor
    this.investmentQueue.process(async (job) => {
      const { action, userId, data } = job.data;
      const investmentService = InvestmentService.getInstance();

      switch (action) {
        case 'update-prices':
          await investmentService.updateInvestmentValues();
          break;
        case 'check-dividends':
          // Check for pending dividends
          break;
      }

      return { success: true };
    });

    // Challenge queue processor
    this.challengeQueue.process(async (job) => {
      const { action, userId, data } = job.data;
      const challengeService = ChallengeService.getInstance();

      switch (action) {
        case 'daily-updates':
          await challengeService.processDailyUpdates();
          break;
        case 'check-expired':
          await challengeService.checkExpiredChallenges();
          break;
      }

      return { success: true };
    });

    // Report queue processor
    this.reportQueue.process(async (job) => {
      const { type, userId, format } = job.data;
      const reportService = ReportService.getInstance();

      switch (type) {
        case 'daily':
          await reportService.generateDailyReport(userId);
          break;
        case 'weekly':
          await reportService.generateWeeklyReport(userId);
          break;
        case 'monthly':
          await reportService.generateMonthlyReport(userId);
          break;
        case 'annual':
          await reportService.generateAnnualReport(userId, new Date().getFullYear());
          break;
        case 'export-pdf':
          // Generate PDF export
          break;
        case 'export-excel':
          // Generate Excel export
          break;
      }

      return { success: true };
    });

    // M-Pesa queue processor
    this.mpesaQueue.process(async (job) => {
      const { action, data } = job.data;
      const mpesaService = MpesaService.getInstance();

      switch (action) {
        case 'query-status':
          await mpesaService.queryStatus(data.checkoutRequestId);
          break;
        case 'sync-transactions':
          // Sync M-PESA transactions
          break;
      }

      return { success: true };
    });

    // Cleanup queue processor
    this.cleanupQueue.process(async (job) => {
      const { action } = job.data;

      switch (action) {
        case 'old-notifications':
          const notificationService = NotificationService.getInstance();
          await notificationService.cleanOldNotifications(30);
          break;
        case 'old-logs':
          // Clean old logs
          break;
        case 'temp-files':
          // Clean temporary files
          break;
      }

      return { success: true };
    });

    // Error handlers
    this.setupErrorHandlers();
  }

  private setupErrorHandlers() {
    const queues = [
      this.emailQueue,
      this.smsQueue,
      this.notificationQueue,
      this.transactionQueue,
      this.goalQueue,
      this.budgetQueue,
      this.investmentQueue,
      this.challengeQueue,
      this.reportQueue,
      this.mpesaQueue,
      this.cleanupQueue
    ];

    queues.forEach(queue => {
      queue.on('error', (error) => {
        console.error(`Queue ${queue.name} error:`, error);
      });

      queue.on('failed', (job, error) => {
        console.error(`Job ${job.id} in queue ${queue.name} failed:`, error);
      });

      queue.on('completed', (job) => {
        console.log(`Job ${job.id} in queue ${queue.name} completed`);
      });
    });
  }

  // Add jobs to queues
  public async addEmailJob(type: string, to: string, data: any, delay?: number) {
    return this.emailQueue.add({ type, to, data }, { delay });
  }

  public async addSMSJob(type: string, to: string, data: any, delay?: number) {
    return this.smsQueue.add({ type, to, data }, { delay });
  }

  public async addNotificationJob(userId: string, type: string, title: string, body: string, data?: any, priority?: string) {
    return this.notificationQueue.add({ userId, type, title, body, data, priority });
  }

  public async addTransactionJob(action: string, userId: string, data?: any, delay?: number) {
    return this.transactionQueue.add({ action, userId, data }, { delay });
  }

  public async addGoalJob(action: string, userId: string, data?: any, delay?: number) {
    return this.goalQueue.add({ action, userId, data }, { delay });
  }

  public async addBudgetJob(action: string, userId: string, data?: any, delay?: number) {
    return this.budgetQueue.add({ action, userId, data }, { delay });
  }

  public async addInvestmentJob(action: string, data?: any, delay?: number) {
    return this.investmentQueue.add({ action, data }, { delay });
  }

  public async addChallengeJob(action: string, data?: any, delay?: number) {
    return this.challengeQueue.add({ action, data }, { delay });
  }

  public async addReportJob(type: string, userId: string, format?: string, delay?: number) {
    return this.reportQueue.add({ type, userId, format }, { delay });
  }

  public async addMpesaJob(action: string, data?: any, delay?: number) {
    return this.mpesaQueue.add({ action, data }, { delay });
  }

  public async addCleanupJob(action: string, delay?: number) {
    return this.cleanupQueue.add({ action }, { delay });
  }

  // Schedule recurring jobs
  public async scheduleRecurringJobs() {
    // Process round-ups every hour
    await this.addTransactionJob('process-roundup', 'system', null, 60 * 60 * 1000);

    // Check budget alerts every 6 hours
    await this.addBudgetJob('check-alerts', 'system', null, 6 * 60 * 60 * 1000);

    // Process auto-save for goals every day at midnight
    const now = new Date();
    const night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const msUntilMidnight = night.getTime() - now.getTime();
    await this.addGoalJob('process-autosave', 'system', null, msUntilMidnight);

    // Check for overdue goals every day at 1 AM
    await this.addGoalJob('check-overdue', 'system', null, msUntilMidnight + 60 * 60 * 1000);

    // Process budget resets every day at 2 AM
    await this.addBudgetJob('process-resets', 'system', null, msUntilMidnight + 2 * 60 * 60 * 1000);

    // Update investment prices every hour during market hours
    await this.addInvestmentJob('update-prices', null, 60 * 60 * 1000);

    // Process challenge daily updates every day at 3 AM
    await this.addChallengeJob('daily-updates', null, msUntilMidnight + 3 * 60 * 60 * 1000);

    // Check expired challenges every day at 4 AM
    await this.addChallengeJob('check-expired', null, msUntilMidnight + 4 * 60 * 60 * 1000);

    // Send daily reports at 8 AM
    const morning = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0);
    const msUntilMorning = morning.getTime() - now.getTime();
    await this.addReportJob('daily', 'all', null, msUntilMorning);

    // Send weekly reports on Monday at 9 AM
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (8 - now.getDay()), 9, 0, 0);
    const msUntilMonday = monday.getTime() - now.getTime();
    await this.addReportJob('weekly', 'all', null, msUntilMonday);

    // Send monthly reports on 1st of month at 10 AM
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 10, 0, 0);
    const msUntilFirst = firstOfMonth.getTime() - now.getTime();
    await this.addReportJob('monthly', 'all', null, msUntilFirst);

    // Clean old notifications every day at 5 AM
    await this.addCleanupJob('old-notifications', msUntilMidnight + 5 * 60 * 60 * 1000);
  }

  // Get queue statistics
  public async getQueueStats() {
    const queues = [
      this.emailQueue,
      this.smsQueue,
      this.notificationQueue,
      this.transactionQueue,
      this.goalQueue,
      this.budgetQueue,
      this.investmentQueue,
      this.challengeQueue,
      this.reportQueue,
      this.mpesaQueue,
      this.cleanupQueue
    ];

    const stats: any = {};

    for (const queue of queues) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount()
      ]);

      stats[queue.name] = {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed
      };
    }

    return stats;
  }

  // Pause all queues
  public async pauseAll() {
    const queues = [
      this.emailQueue,
      this.smsQueue,
      this.notificationQueue,
      this.transactionQueue,
      this.goalQueue,
      this.budgetQueue,
      this.investmentQueue,
      this.challengeQueue,
      this.reportQueue,
      this.mpesaQueue,
      this.cleanupQueue
    ];

    for (const queue of queues) {
      await queue.pause();
    }
  }

  // Resume all queues
  public async resumeAll() {
    const queues = [
      this.emailQueue,
      this.smsQueue,
      this.notificationQueue,
      this.transactionQueue,
      this.goalQueue,
      this.budgetQueue,
      this.investmentQueue,
      this.challengeQueue,
      this.reportQueue,
      this.mpesaQueue,
      this.cleanupQueue
    ];

    for (const queue of queues) {
      await queue.resume();
    }
  }

  // Close all queues
  public async closeAll() {
    const queues = [
      this.emailQueue,
      this.smsQueue,
      this.notificationQueue,
      this.transactionQueue,
      this.goalQueue,
      this.budgetQueue,
      this.investmentQueue,
      this.challengeQueue,
      this.reportQueue,
      this.mpesaQueue,
      this.cleanupQueue
    ];

    for (const queue of queues) {
      await queue.close();
    }
  }
}
