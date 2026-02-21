import { Notification } from '@/models/Notification.model';
import { User } from '@/models/User.model';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';
import { RedisService } from './redis.service';
import { AppError } from '@/middleware/errorHandler';
import { io } from '@/server';
import { Types } from 'mongoose';

export class NotificationService {
  private static instance: NotificationService;
  private emailService: EmailService;
  private smsService: SMSService;
  private redisService: RedisService;

  private constructor() {
    this.emailService = EmailService.getInstance();
    this.smsService = SMSService.getInstance();
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create notification
  public async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: any,
    priority: string = 'medium',
    actions?: any[],
    expiresIn?: number
  ): Promise<any> {
    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      data,
      priority,
      actions,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined
    });

    // Send real-time notification via socket
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }

    // Send based on user preferences
    const user = await User.findById(userId);
    
    if (user?.preferences.notifications) {
      const prefs = user.preferences.notifications;
      
      // Send email if enabled
      if (prefs.email && this.shouldSendEmail(type)) {
        await this.sendEmailNotification(user.email, user.firstName, notification);
      }

      // Send SMS if enabled and type is important
      if (prefs.sms && this.shouldSendSMS(type, priority)) {
        await this.sendSMSNotification(user.phoneNumber, notification);
      }

      // Send push if enabled
      if (prefs.push) {
        await this.sendPushNotification(userId, notification);
      }
    }

    return notification;
  }

  // Should send email
  private shouldSendEmail(type: string): boolean {
    const emailTypes = [
      'weekly_report',
      'monthly_report',
      'security_alert',
      'payment_reminder',
      'achievement_unlocked'
    ];
    return emailTypes.includes(type);
  }

  // Should send SMS
  private shouldSendSMS(type: string, priority: string): boolean {
    const smsTypes = [
      'security_alert',
      'transaction_alert',
      'budget_alert',
      'payment_reminder'
    ];
    return smsTypes.includes(type) || priority === 'urgent';
  }

  // Send email notification
  private async sendEmailNotification(email: string, name: string, notification: any): Promise<void> {
    try {
      await this.emailService.sendWithRateLimit(email, notification.title, `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${notification.title}</h2>
          <p>Hello ${name},</p>
          <p>${notification.body}</p>
          ${notification.actions ? `
            <div style="margin: 20px 0;">
              ${notification.actions.map((action: any) => `
                <a href="${action.url}" style="display: inline-block; padding: 10px 20px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; margin-right: 10px;">
                  ${action.label}
                </a>
              `).join('')}
            </div>
          ` : ''}
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This notification was sent from The Base. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // Send SMS notification
  private async sendSMSNotification(phoneNumber: string, notification: any): Promise<void> {
    try {
      const message = `
        ${notification.title}
        
        ${notification.body}
        
        - The Base
      `;

      await this.smsService.sendWithRateLimit(phoneNumber, message);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  // Send push notification
  private async sendPushNotification(userId: string, notification: any): Promise<void> {
    try {
      if (io) {
        io.to(`user:${userId}`).emit('push', {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          actions: notification.actions
        });
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // Get user notifications
  public async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<any> {
    const query: any = { userId };
    
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Mark notification as read
  public async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await notification.markAsRead();
  }

  // Mark all as read
  public async markAllAsRead(userId: string): Promise<void> {
    await Notification.markAllAsRead(userId);
  }

  // Delete notification
  public async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await Notification.deleteOne({ _id: notificationId, userId });
    
    if (result.deletedCount === 0) {
      throw new AppError('Notification not found', 404);
    }
  }

  // Clear all notifications
  public async clearAll(userId: string): Promise<void> {
    await Notification.deleteMany({ userId });
  }

  // Create budget alert
  public async createBudgetAlert(userId: string, budget: any, percentage: number): Promise<void> {
    await this.createNotification(
      userId,
      'budget_alert',
      percentage >= 100 ? '⚠️ Budget Exceeded' : '📊 Budget Alert',
      `You've used ${percentage.toFixed(1)}% of your ${budget.name} budget`,
      { budgetId: budget._id, percentage },
      percentage >= 100 ? 'high' : 'medium',
      [
        {
          id: 'view_budget',
          label: 'View Budget',
          action: 'navigate',
          url: `/budgets/${budget._id}`
        },
        {
          id: 'adjust_budget',
          label: 'Adjust Budget',
          action: 'navigate',
          url: `/budgets/${budget._id}/edit`
        }
      ]
    );
  }

  // Create goal progress notification
  public async createGoalProgress(userId: string, goal: any, progress: number): Promise<void> {
    const title = progress >= 100 
      ? '🎉 Goal Achieved!' 
      : progress >= 75 
        ? '🎯 Almost There!' 
        : '📈 Goal Progress';

    await this.createNotification(
      userId,
      'goal_progress',
      title,
      `You're ${progress.toFixed(1)}% of the way to your ${goal.name} goal`,
      { goalId: goal._id, progress },
      progress >= 100 ? 'high' : 'medium',
      [
        {
          id: 'view_goal',
          label: 'View Goal',
          action: 'navigate',
          url: `/goals/${goal._id}`
        }
      ]
    );
  }

  // Create achievement unlocked notification
  public async createAchievementUnlocked(userId: string, badge: any): Promise<void> {
    await this.createNotification(
      userId,
      'achievement_unlocked',
      '🏆 Achievement Unlocked!',
      `You've earned the ${badge.name} badge`,
      { badge },
      'high',
      [
        {
          id: 'view_achievements',
          label: 'View Achievements',
          action: 'navigate',
          url: '/achievements'
        },
        {
          id: 'share',
          label: 'Share',
          action: 'share',
          data: { text: `I just earned the ${badge.name} badge on The Base!` }
        }
      ],
      7 * 24 * 60 * 60 * 1000 // 7 days
    );
  }

  // Create investment update
  public async createInvestmentUpdate(
    userId: string,
    investment: any,
    change: number
  ): Promise<void> {
    const isPositive = change > 0;

    await this.createNotification(
      userId,
      'investment_update',
      isPositive ? '📈 Investment Update' : '📉 Investment Alert',
      `${investment.name} is ${isPositive ? 'up' : 'down'} by ${Math.abs(change).toFixed(2)}%`,
      { investmentId: investment._id, change },
      isPositive ? 'low' : 'high',
      [
        {
          id: 'view_investment',
          label: 'View Details',
          action: 'navigate',
          url: `/investments/${investment._id}`
        }
      ]
    );
  }

  // Create transaction alert
  public async createTransactionAlert(
    userId: string,
    transaction: any
  ): Promise<void> {
    const isIncome = transaction.type === 'income';
    const emoji = isIncome ? '💰' : '💳';

    await this.createNotification(
      userId,
      'transaction_alert',
      `${emoji} ${isIncome ? 'Money Received' : 'Payment Made'}`,
      `${isIncome ? 'Received' : 'Paid'} KES ${Math.abs(transaction.amount).toLocaleString()} ${transaction.description}`,
      { transactionId: transaction._id },
      transaction.amount > 10000 ? 'high' : 'low',
      [
        {
          id: 'view_transaction',
          label: 'View Transaction',
          action: 'navigate',
          url: `/transactions/${transaction._id}`
        }
      ]
    );
  }

  // Create challenge update
  public async createChallengeUpdate(
    userId: string,
    challenge: any,
    progress: number
  ): Promise<void> {
    await this.createNotification(
      userId,
      'challenge_update',
      '🏆 Challenge Update',
      `You're ${progress.toFixed(1)}% through the ${challenge.name} challenge`,
      { challengeId: challenge._id, progress },
      'medium',
      [
        {
          id: 'view_challenge',
          label: 'View Challenge',
          action: 'navigate',
          url: `/challenges/${challenge._id}`
        }
      ]
    );
  }

  // Create weekly report
  public async createWeeklyReport(userId: string, reportData: any): Promise<void> {
    await this.createNotification(
      userId,
      'weekly_report',
      '📊 Your Weekly Financial Report',
      `You saved KES ${reportData.savings?.toLocaleString() || 0} this week with a ${reportData.savingsRate?.toFixed(1) || 0}% savings rate`,
      { report: reportData },
      'medium',
      [
        {
          id: 'view_report',
          label: 'View Full Report',
          action: 'navigate',
          url: '/reports/weekly'
        }
      ],
      7 * 24 * 60 * 60 * 1000 // 7 days
    );
  }

  // Create security alert
  public async createSecurityAlert(
    userId: string,
    alertType: string,
    details: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'security_alert',
      '🔐 Security Alert',
      `${alertType}: ${details}`,
      { type: alertType, details },
      'urgent',
      [
        {
          id: 'review_security',
          label: 'Review Security',
          action: 'navigate',
          url: '/settings/security'
        },
        {
          id: 'contact_support',
          label: 'Contact Support',
          action: 'navigate',
          url: '/support'
        }
      ],
      30 * 24 * 60 * 60 * 1000 // 30 days
    );
  }

  // Create payment reminder
  public async createPaymentReminder(
    userId: string,
    bill: any,
    daysUntilDue: number
  ): Promise<void> {
    const urgency = daysUntilDue <= 1 ? 'urgent' : daysUntilDue <= 3 ? 'high' : 'medium';
    
    await this.createNotification(
      userId,
      'payment_reminder',
      daysUntilDue === 0 ? '⚠️ Payment Due Today' : `📅 Payment Reminder: ${daysUntilDue} days left`,
      `${bill.name} of KES ${bill.amount.toLocaleString()} is due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} days`}`,
      { bill },
      urgency,
      [
        {
          id: 'pay_now',
          label: 'Pay Now',
          action: 'payment',
          data: { billId: bill._id }
        },
        {
          id: 'remind_later',
          label: 'Remind Later',
          action: 'snooze',
          data: { hours: 24 }
        }
      ]
    );
  }

  // Create streak notification
  public async createStreakNotification(
    userId: string,
    streakDays: number
  ): Promise<void> {
    const fireEmojis = '🔥'.repeat(Math.min(streakDays, 5));
    
    await this.createNotification(
      userId,
      'ai_insight',
      `${fireEmojis} ${streakDays} Day Streak!`,
      `You've logged in for ${streakDays} consecutive days! Keep up the great financial habits.`,
      { streakDays },
      streakDays % 7 === 0 ? 'high' : 'low',
      [
        {
          id: 'view_streak',
          label: 'View Achievements',
          action: 'navigate',
          url: '/achievements'
        }
      ]
    );
  }

  // Clean old notifications
  public async cleanOldNotifications(days: number = 30): Promise<number> {
    const result = await Notification.cleanOld(days);
    return result.deletedCount || 0;
  }

  // Get unread count
  public async getUnreadCount(userId: string): Promise<number> {
    return Notification.getUnreadCount(userId);
  }

  // Get notification preferences
  public async getPreferences(userId: string): Promise<any> {
    const user = await User.findById(userId).select('preferences.notifications');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.preferences.notifications;
  }

  // Update notification preferences
  public async updatePreferences(userId: string, preferences: any): Promise<void> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...preferences
    };

    await user.save();
  }

  // Subscribe to push notifications
  public async subscribePush(userId: string, subscription: any): Promise<void> {
    const key = `push:subscription:${userId}`;
    await this.redisService.set(key, JSON.stringify(subscription));
  }

  // Unsubscribe from push notifications
  public async unsubscribePush(userId: string): Promise<void> {
    const key = `push:subscription:${userId}`;
    await this.redisService.del(key);
  }

  // Get push subscription
  public async getPushSubscription(userId: string): Promise<any> {
    const key = `push:subscription:${userId}`;
    const subscription = await this.redisService.get(key);
    return subscription ? JSON.parse(subscription) : null;
  }
}
