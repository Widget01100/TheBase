import axios from 'axios';
import { RedisService } from './redis.service';
import { AppError } from '@/middleware/errorHandler';

export class SMSService {
  private static instance: SMSService;
  private redisService: RedisService;
  private baseURL: string;
  private apiKey: string;
  private username: string;
  private senderId: string;

  private constructor() {
    this.redisService = RedisService.getInstance();
    this.baseURL = 'https://api.africastalking.com/version1/messaging';
    this.apiKey = process.env.AT_API_KEY!;
    this.username = process.env.AT_USERNAME!;
    this.senderId = process.env.AT_SENDER_ID!;
  }

  public static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  // Format phone number to international format
  private formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  // Send SMS with rate limiting
  private async sendWithRateLimit(to: string, message: string): Promise<void> {
    const key = `sms:${to}`;
    const count = await this.redisService.get(key);
    
    if (count && parseInt(count) >= 3) {
      throw new AppError('Too many SMS sent to this number. Please try again later.', 429);
    }

    await this.redisService.incr(key);
    await this.redisService.expire(key, 3600); // 1 hour

    const formattedNumber = this.formatPhoneNumber(to);

    try {
      const response = await axios.post(
        this.baseURL,
        new URLSearchParams({
          username: this.username,
          to: formattedNumber,
          message: message,
          from: this.senderId,
          bulkSMSMode: '1',
          enqueue: '1'
        }),
        {
          headers: {
            'apiKey': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.SMSMessageData?.Recipients?.[0]?.status !== 'Success') {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new AppError('Failed to send SMS', 500);
    }
  }

  // Send verification code
  public async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    const message = `
      Your The Base verification code is: ${code}
      
      This code will expire in 10 minutes.
      
      If you didn't request this code, please ignore this message.
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send login notification
  public async sendLoginNotification(phoneNumber: string, deviceInfo: any): Promise<void> {
    const message = `
      🔐 New login to your The Base account
      
      Device: ${deviceInfo?.deviceName || 'Unknown'}
      Time: ${new Date().toLocaleString()}
      Location: ${deviceInfo?.location || 'Unknown'}
      
      If this wasn't you, please secure your account immediately.
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send transaction alert
  public async sendTransactionAlert(
    phoneNumber: string,
    amount: number,
    type: string,
    description: string
  ): Promise<void> {
    const emoji = type === 'income' ? '💰' : type === 'expense' ? '💳' : '🔄';
    
    const message = `
      ${emoji} Transaction Alert
      
      ${description}
      Amount: KES ${amount.toLocaleString()}
      Type: ${type.toUpperCase()}
      Time: ${new Date().toLocaleString()}
      
      Check your dashboard for details.
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send goal progress
  public async sendGoalProgress(
    phoneNumber: string,
    goalName: string,
    progress: number,
    targetAmount: number,
    currentAmount: number
  ): Promise<void> {
    const emoji = progress >= 100 ? '🎉' : '🎯';
    
    const message = `
      ${emoji} Goal Progress Update
      
      ${goalName}: ${progress.toFixed(1)}% complete
      Saved: KES ${currentAmount.toLocaleString()} / KES ${targetAmount.toLocaleString()}
      
      ${progress >= 100 
        ? 'Congratulations! You\'ve achieved your goal! 🏆' 
        : `Keep going! You need KES ${(targetAmount - currentAmount).toLocaleString()} more.`}
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send budget alert
  public async sendBudgetAlert(
    phoneNumber: string,
    budgetName: string,
    percentage: number,
    spent: number,
    limit: number
  ): Promise<void> {
    const isOverBudget = percentage >= 100;
    const emoji = isOverBudget ? '⚠️' : '📊';
    
    const message = `
      ${emoji} Budget Alert
      
      ${budgetName}: ${percentage.toFixed(1)}% used
      Spent: KES ${spent.toLocaleString()}
      Limit: KES ${limit.toLocaleString()}
      
      ${isOverBudget 
        ? 'You\'ve exceeded your budget. Review your spending.' 
        : `Remaining: KES ${(limit - spent).toLocaleString()}`}
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send investment update
  public async sendInvestmentUpdate(
    phoneNumber: string,
    investmentName: string,
    change: number,
    totalValue: number
  ): Promise<void> {
    const isPositive = change > 0;
    const emoji = isPositive ? '📈' : '📉';
    
    const message = `
      ${emoji} Investment Update
      
      ${investmentName}
      ${isPositive ? '+' : ''}${change.toFixed(2)}% change
      Current Value: KES ${totalValue.toLocaleString()}
      
      ${isPositive 
        ? 'Great performance! Keep up the good investment strategy.' 
        : 'Market fluctuations are normal. Stay invested for long-term gains.'}
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send challenge reminder
  public async sendChallengeReminder(
    phoneNumber: string,
    challengeName: string,
    progress: number,
    daysLeft: number
  ): Promise<void> {
    const message = `
      🏆 Challenge Reminder
      
      ${challengeName}
      Progress: ${progress.toFixed(1)}%
      Days Left: ${daysLeft}
      
      ${daysLeft === 0 
        ? 'Final day! Complete your challenge today!' 
        : `Keep pushing! You've got ${daysLeft} days left.`}
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send weekly summary
  public async sendWeeklySummary(
    phoneNumber: string,
    summary: any
  ): Promise<void> {
    const message = `
      📊 Your Weekly Financial Summary
      
      Income: KES ${summary.income?.toLocaleString() || 0}
      Expenses: KES ${summary.expenses?.toLocaleString() || 0}
      Saved: KES ${summary.savings?.toLocaleString() || 0}
      Savings Rate: ${summary.savingsRate?.toFixed(1) || 0}%
      
      Top Category: ${summary.topCategory || 'N/A'}
      
      View full report in your dashboard.
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send M-PESA transaction notification
  public async sendMpesaNotification(
    phoneNumber: string,
    amount: number,
    type: string,
    receiptNumber: string,
    balance?: number
  ): Promise<void> {
    const emoji = type === 'received' ? '💰' : type === 'sent' ? '💸' : '🔄';
    
    const message = `
      ${emoji} M-PESA ${type.toUpperCase()}
      
      Amount: KES ${amount.toLocaleString()}
      Receipt: ${receiptNumber}
      ${balance ? `Balance: KES ${balance.toLocaleString()}` : ''}
      Time: ${new Date().toLocaleString()}
      
      - The Base 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send security alert
  public async sendSecurityAlert(
    phoneNumber: string,
    alertType: string,
    details: string
  ): Promise<void> {
    const message = `
      🔐 Security Alert
      
      ${alertType}
      ${details}
      Time: ${new Date().toLocaleString()}
      
      If this wasn't you, please secure your account immediately.
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send achievement unlocked
  public async sendAchievementUnlocked(
    phoneNumber: string,
    badgeName: string,
    badgeDescription: string
  ): Promise<void> {
    const message = `
      🏆 Achievement Unlocked!
      
      ${badgeName}
      ${badgeDescription}
      
      Congratulations! You've earned a new badge.
      Check your profile to see all your achievements.
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send referral notification
  public async sendReferralNotification(
    phoneNumber: string,
    referrerName: string,
    bonusAmount: number
  ): Promise<void> {
    const message = `
      🎉 Referral Bonus Earned!
      
      ${referrerName} joined The Base using your referral!
      You've earned KES ${bonusAmount.toLocaleString()} as a bonus.
      
      Keep sharing and earn more rewards!
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send birthday greeting
  public async sendBirthdayGreeting(
    phoneNumber: string,
    name: string
  ): Promise<void> {
    const message = `
      🎂 Happy Birthday ${name}!
      
      Wishing you a fantastic day filled with joy and prosperity.
      
      As a special gift, we've added KES 500 to your account!
      Use it to boost your savings or treat yourself.
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }

  // Send streak reminder
  public async sendStreakReminder(
    phoneNumber: string,
    streakDays: number,
    message: string
  ): Promise<void> {
    const fireEmojis = '🔥'.repeat(Math.min(streakDays, 5));
    
    const sms = `
      ${fireEmojis} ${streakDays} Day Streak!
      
      ${message}
      
      Keep up the great financial habits!
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, sms);
  }

  // Send emergency alert
  public async sendEmergencyAlert(
    phoneNumber: string,
    alertType: string,
    action: string
  ): Promise<void> {
    const message = `
      🚨 EMERGENCY ALERT
      
      ${alertType}
      
      Action required: ${action}
      
      Please log in to your account immediately.
      
      - The Base Team 🇰🇪
    `;

    await this.sendWithRateLimit(phoneNumber, message);
  }
}
