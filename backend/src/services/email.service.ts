import nodemailer from 'nodemailer';
import { RedisService } from './redis.service';
import { AppError } from '@/middleware/errorHandler';

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;
  private redisService: RedisService;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });

    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Verify connection
  public async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }

  // Send email with rate limiting
  private async sendWithRateLimit(to: string, subject: string, html: string): Promise<void> {
    const key = `email:${to}`;
    const count = await this.redisService.get(key);
    
    if (count && parseInt(count) >= 5) {
      throw new AppError('Too many emails sent to this address. Please try again later.', 429);
    }

    await this.redisService.incr(key);
    await this.redisService.expire(key, 3600); // 1 hour

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High'
      }
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Welcome email
  public async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to The Base</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 32px;
            font-weight: 700;
          }
          .header p {
            color: rgba(255,255,255,0.9);
            margin: 10px 0 0;
            font-size: 18px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #0ea5e9;
            margin-top: 0;
            font-size: 24px;
          }
          .content p {
            margin: 20px 0;
            font-size: 16px;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .feature {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
          }
          .feature .emoji {
            font-size: 32px;
            margin-bottom: 10px;
          }
          .feature h3 {
            margin: 10px 0 5px;
            color: #0ea5e9;
            font-size: 18px;
          }
          .feature p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          .cta-button {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .footer a {
            color: #0ea5e9;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .features {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Karibu, ${name}! 🇰🇪</h1>
            <p>Welcome to The Base - Your Financial Command Center</p>
          </div>
          <div class="content">
            <h2>Your journey to financial freedom starts here</h2>
            <p>We're thrilled to have you join The Base community. You've taken the first step toward taking complete control of your finances with Kenya's most comprehensive personal finance platform.</p>
            
            <div class="features">
              <div class="feature">
                <div class="emoji">📊</div>
                <h3>Track Everything</h3>
                <p>GitHub-style contribution tracker for your finances</p>
              </div>
              <div class="feature">
                <div class="emoji">💳</div>
                <h3>M-PESA Integration</h3>
                <p>Auto-sync transactions, round-up savings</p>
              </div>
              <div class="feature">
                <div class="emoji">🤖</div>
                <h3>AI Coach Malkia</h3>
                <p>Your personal financial strategist</p>
              </div>
              <div class="feature">
                <div class="emoji">🎯</div>
                <h3>Goal Setting</h3>
                <p>52-week challenge, savings goals, investments</p>
              </div>
            </div>

            <p>Here's what you can do next:</p>
            <ul style="margin: 20px 0; padding-left: 20px;">
              <li>✅ Complete your profile setup</li>
              <li>✅ Connect your M-PESA for auto-sync</li>
              <li>✅ Set your first savings goal</li>
              <li>✅ Start the 52-week challenge</li>
              <li>✅ Chat with Malkia for personalized advice</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">
                Go to Your Dashboard →
              </a>
            </div>

            <p style="font-style: italic; color: #666; margin-top: 30px;">
              "Pesa ni mizizi, usiipoteze bure." - Money is roots, don't waste it foolishly.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Base. All rights reserved.</p>
            <p>
              <a href="${process.env.CLIENT_URL}/privacy">Privacy</a> • 
              <a href="${process.env.CLIENT_URL}/terms">Terms</a> • 
              <a href="${process.env.CLIENT_URL}/support">Support</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px;">
              Made with ❤️ for Kenya
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendWithRateLimit(email, 'Karibu to The Base! 🇰🇪', html);
  }

  // Email verification
  public async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .verification-button {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .note {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for signing up for The Base. Please verify your email address to activate your account and start your financial journey.</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="verification-button">
                Verify Email Address
              </a>
            </div>

            <div class="note">
              <p style="margin: 0; font-weight: 600;">⏰ This link will expire in 24 hours</p>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0ea5e9;">${verificationUrl}</p>

            <p>If you didn't create an account with The Base, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Base</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendWithRateLimit(email, 'Verify Your Email - The Base', html);
  }

  // Password reset
  public async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .reset-button {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .warning {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your password for your The Base account.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">
                Reset Password
              </a>
            </div>

            <div class="warning">
              <p style="margin: 0; font-weight: 600;">⚠️ This link will expire in 1 hour</p>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #f59e0b;">${resetUrl}</p>

            <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Base</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendWithRateLimit(email, 'Reset Your Password - The Base', html);
  }

  // Login notification
  public async sendLoginNotification(email: string, name: string, deviceInfo: any): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login Detected</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981, #059669);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .device-info {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
          }
          .device-info p {
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background: #ef4444;
            color: white;
            text-decoration: none;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Login Detected</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We detected a new login to your The Base account.</p>
            
            <div class="device-info">
              <h3 style="margin-top: 0;">Device Information:</h3>
              <p><strong>Device:</strong> ${deviceInfo?.deviceName || 'Unknown'}</p>
              <p><strong>Browser:</strong> ${deviceInfo?.browser || 'Unknown'}</p>
              <p><strong>Location:</strong> ${deviceInfo?.location || 'Unknown'}</p>
              <p><strong>IP Address:</strong> ${deviceInfo?.ip || 'Unknown'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>If this was you, you can ignore this email. If you don't recognize this activity, please secure your account immediately.</p>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/security" class="button">
                Review Security Settings
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Base</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendWithRateLimit(email, '🔐 New Login to Your The Base Account', html);
  }

  // Password changed notification
  public async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981, #059669);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Changed</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your The Base account password was successfully changed.</p>
            
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>

            <p>If you made this change, no further action is needed. If you didn't, please contact support immediately.</p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL}/support" style="color: #0ea5e9;">
                Contact Support
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Base</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendWithRateLimit(email, '✅ Your Password Has Been Changed - The Base', html);
  }

  // Weekly report
  public async sendWeeklyReport(email: string, name: string, reportData: any): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Financial Report</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .stat-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #0ea5e9;
            margin: 10px 0;
          }
          .stat-label {
            color: #64748b;
            font-size: 14px;
          }
          .positive {
            color: #10b981;
          }
          .negative {
            color: #ef4444;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #0ea5e9;
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Weekly Financial Report</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Here's your financial summary for the past week:</p>

            <div class="stats-grid">
              <div class="stat-card">
                <div>💰</div>
                <div class="stat-value">KES ${reportData.income?.toLocaleString() || 0}</div>
                <div class="stat-label">Income</div>
              </div>
              <div class="stat-card">
                <div>💳</div>
                <div class="stat-value">KES ${reportData.expenses?.toLocaleString() || 0}</div>
                <div class="stat-label">Expenses</div>
              </div>
              <div class="stat-card">
                <div>🏦</div>
                <div class="stat-value">KES ${reportData.savings?.toLocaleString() || 0}</div>
                <div class="stat-label">Saved</div>
              </div>
              <div class="stat-card">
                <div>📈</div>
                <div class="stat-value">${reportData.savingsRate?.toFixed(1) || 0}%</div>
                <div class="stat-label">Savings Rate</div>
              </div>
            </div>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0369a1;">💡 Malkia's Insight</h3>
              <p>${reportData.insight || "You're doing great! Keep up the good financial habits."}</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">
                View Full Report
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Base</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendWithRateLimit(email, '📊 Your Weekly Financial Report - The Base', html);
  }

  // Goal achievement
  public async sendGoalAchievedEmail(email: string, name: string, goalName: string, amount: number): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎉 Goal Achieved!</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 32px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .achievement-badge {
            font-size: 80px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .button {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Goal Achieved!</h1>
          </div>
          <div class="content">
            <div class="achievement-badge">🏆</div>
            <h2>Congratulations ${name}!</h2>
            <p style="font-size: 18px;">You've successfully achieved your goal:</p>
            <p style="font-size: 24px; font-weight: 700; color: #f59e0b;">${goalName}</p>
            <p style="font-size: 20px;">You saved KES ${amount.toLocaleString()}!</p>
            
            <p style="margin: 30px 0;">This is a huge accomplishment. Keep up the great work!</p>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/goals" class="button">
                Set Your Next Goal
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Base</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendWithRateLimit(email, '🎉 Congratulations! You Achieved Your Goal - The Base', html);
  }

  // Budget alert
  public async sendBudgetAlertEmail(email: string, name: string, budgetName: string, percentage: number, spent: number, limit: number): Promise<void> {
    const isOverBudget = percentage >= 100;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isOverBudget ? '⚠️ Budget Alert - Over Budget' : '📊 Budget Alert - Near Limit'}</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: ${isOverBudget 
              ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
              : 'linear-gradient(135deg, #f59e0b, #d97706)'};
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .progress-circle {
            width: 150px;
            height: 150px;
            margin: 20px auto;
            position: relative;
          }
          .percentage {
            font-size: 48px;
            font-weight: 700;
            color: ${isOverBudget ? '#ef4444' : '#f59e0b'};
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: ${isOverBudget ? '#ef4444' : '#f59e0b'};
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isOverBudget ? '⚠️ Budget Alert' : '📊 Budget Alert'}</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            
            <div class="percentage">${percentage.toFixed(1)}%</div>
            <p>of your ${budgetName} budget used</p>

            <div style="margin: 30px 0;">
              <p style="font-size: 18px;"><strong>Spent:</strong> KES ${spent.toLocaleString()}</p>
              <p style="font-size: 18px;"><strong>Limit:</strong> KES ${limit.toLocaleString()}</p>
              ${!isOverBudget ? `<p><strong>Remaining:</strong> KES ${(limit - spent).toLocaleString()}</p>` : ''}
            </div>

            ${isOverBudget 
              ? '<p style="color: #ef4444;">You\'ve exceeded your budget. Consider reviewing your spending.</p>'
              : '<p>You\'re approaching your budget limit. Consider adjusting your spending.</p>'
            }

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/budgets" class="button">
                View Budget Details
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} The Base</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendWithRateLimit(
      email, 
      isOverBudget ? '⚠️ You\'ve Exceeded Your Budget - The Base' : '📊 Budget Alert - The Base', 
      html
    );
  }
}
