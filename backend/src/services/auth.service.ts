import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '@/models/User.model';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';
import { RedisService } from './redis.service';
import { AppError } from '@/middleware/errorHandler';
import { IUser } from '@/types';

export class AuthService {
  private static instance: AuthService;
  private emailService: EmailService;
  private smsService: SMSService;
  private redisService: RedisService;

  private constructor() {
    this.emailService = EmailService.getInstance();
    this.smsService = SMSService.getInstance();
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generate JWT tokens
  public generateTokens(userId: string, deviceId?: string) {
    const accessToken = jwt.sign(
      { 
        id: userId,
        type: 'access',
        deviceId 
      },
      process.env.JWT_SECRET!,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      }
    );

    const refreshToken = jwt.sign(
      { 
        id: userId,
        type: 'refresh',
        deviceId 
      },
      process.env.JWT_REFRESH_SECRET!,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      }
    );

    return { accessToken, refreshToken };
  }

  // Verify token
  public verifyToken(token: string, type: 'access' | 'refresh' = 'access'): any {
    const secret = type === 'access' ? process.env.JWT_SECRET! : process.env.JWT_REFRESH_SECRET!;
    
    try {
      return jwt.verify(token, secret, {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      });
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  // Refresh access token
  public async refreshAccessToken(refreshToken: string, deviceId?: string) {
    const decoded = this.verifyToken(refreshToken, 'refresh');
    
    // Check if token is blacklisted
    const isBlacklisted = await this.redisService.get(`blacklist:${refreshToken}`);
    if (isBlacklisted) {
      throw new AppError('Token has been revoked', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    // Generate new tokens
    const tokens = this.generateTokens(user.id, deviceId);

    // Blacklist old refresh token
    await this.redisService.set(
      `blacklist:${refreshToken}`,
      'true',
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800') // 7 days in seconds
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles
      }
    };
  }

  // Register new user
  public async register(userData: Partial<IUser>) {
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { phoneNumber: userData.phoneNumber }
      ]
    });

    if (existingUser) {
      throw new AppError('User already exists with this email or phone number', 400);
    }

    // Create user
    const user = await User.create(userData);

    // Generate verification tokens
    const emailVerificationToken = user.generateEmailVerificationToken();
    const phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store phone verification code in Redis
    await this.redisService.set(
      `verify:phone:${user.phoneNumber}`,
      phoneVerificationCode,
      600 // 10 minutes
    );

    // Send verification emails/sms
    await Promise.all([
      this.emailService.sendVerificationEmail(user.email, user.firstName, emailVerificationToken),
      this.smsService.sendVerificationCode(user.phoneNumber, phoneVerificationCode)
    ]);

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        roles: user.roles
      },
      ...tokens
    };
  }

  // Login
  public async login(email: string, password: string, deviceInfo?: any) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check login attempts
    const attempts = await this.redisService.get(`login:attempts:${email}`);
    if (attempts && parseInt(attempts) >= parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')) {
      throw new AppError('Too many failed attempts. Please try again later.', 429);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment failed attempts
      await this.redisService.incr(`login:attempts:${email}`);
      await this.redisService.expire(`login:attempts:${email}`, 900); // 15 minutes

      throw new AppError('Invalid email or password', 401);
    }

    // Reset failed attempts
    await this.redisService.del(`login:attempts:${email}`);

    // Update last login
    user.lastLogin = new Date();
    user.lastActive = new Date();
    
    // Add device to history if provided
    if (deviceInfo) {
      user.security.deviceHistory.push({
        ...deviceInfo,
        lastActive: new Date()
      });
      
      // Keep only last 10 devices
      if (user.security.deviceHistory.length > 10) {
        user.security.deviceHistory = user.security.deviceHistory.slice(-10);
      }
    }
    
    // Update streak
    user.updateStreak();
    
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user.id, deviceInfo?.deviceId);

    // Send login notification if enabled
    if (user.security.loginNotifications) {
      await this.emailService.sendLoginNotification(user.email, user.firstName, deviceInfo);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        roles: user.roles,
        stats: user.stats,
        preferences: user.preferences
      },
      ...tokens
    };
  }

  // Logout
  public async logout(refreshToken: string) {
    // Blacklist the refresh token
    await this.redisService.set(
      `blacklist:${refreshToken}`,
      'true',
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800')
    );
  }

  // Logout from all devices
  public async logoutAll(userId: string) {
    // Generate a new token version
    const version = crypto.randomBytes(16).toString('hex');
    await this.redisService.set(`user:${userId}:tokenVersion`, version);
    
    // Clear all refresh tokens for this user
    // In a real implementation, you might want to blacklist all tokens
    // This is simplified for brevity
  }

  // Change password
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Check if password was used before
    const wasUsed = await user.wasPasswordUsed(newPassword);
    if (wasUsed) {
      throw new AppError('Password has been used recently. Please choose a different password.', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send notification
    await this.emailService.sendPasswordChangedEmail(user.email, user.firstName);

    // Logout from all devices except current
    await this.logoutAll(userId);
  }

  // Forgot password
  public async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
  }

  // Reset password
  public async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Check if password was used before
    const wasUsed = await user.wasPasswordUsed(newPassword);
    if (wasUsed) {
      throw new AppError('Password has been used recently. Please choose a different password.', 400);
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Logout from all devices
    await this.logoutAll(user.id);
  }

  // Verify email
  public async verifyEmail(token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    // Award XP for email verification
    user.addExperience(100);
    
    await user.save();

    return user;
  }

  // Verify phone
  public async verifyPhone(phoneNumber: string, code: string) {
    const storedCode = await this.redisService.get(`verify:phone:${phoneNumber}`);
    
    if (!storedCode || storedCode !== code) {
      throw new AppError('Invalid verification code', 400);
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isPhoneVerified = true;
    
    // Award XP for phone verification
    user.addExperience(100);
    
    await user.save();

    // Delete verification code
    await this.redisService.del(`verify:phone:${phoneNumber}`);

    return user;
  }

  // Resend verification email
  public async resendVerificationEmail(email: string) {
    const user = await User.findOne({ email });
    
    if (!user || user.isEmailVerified) {
      return;
    }

    // Check rate limit
    const lastSent = await this.redisService.get(`verify:email:last:${email}`);
    if (lastSent) {
      throw new AppError('Please wait before requesting another verification email', 429);
    }

    // Generate new token
    const token = user.generateEmailVerificationToken();
    await user.save();

    // Send email
    await this.emailService.sendVerificationEmail(user.email, user.firstName, token);

    // Rate limit
    await this.redisService.set(`verify:email:last:${email}`, 'true', 60); // 1 minute
  }

  // Resend phone verification
  public async resendPhoneVerification(phoneNumber: string) {
    const user = await User.findOne({ phoneNumber });
    
    if (!user || user.isPhoneVerified) {
      return;
    }

    // Check rate limit
    const lastSent = await this.redisService.get(`verify:phone:last:${phoneNumber}`);
    if (lastSent) {
      throw new AppError('Please wait before requesting another verification code', 429);
    }

    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in Redis
    await this.redisService.set(
      `verify:phone:${phoneNumber}`,
      code,
      600 // 10 minutes
    );

    // Send SMS
    await this.smsService.sendVerificationCode(phoneNumber, code);

    // Rate limit
    await this.redisService.set(`verify:phone:last:${phoneNumber}`, 'true', 60); // 1 minute
  }

  // Enable 2FA
  public async enable2FA(userId: string, method: 'sms' | 'email' | 'app') {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.security.twoFactorEnabled = true;
    user.security.twoFactorMethod = method;
    await user.save();

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store backup codes securely (in production, hash them)
    // This is simplified for brevity

    return { backupCodes };
  }

  // Disable 2FA
  public async disable2FA(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.security.twoFactorEnabled = false;
    user.security.twoFactorMethod = undefined;
    await user.save();
  }

  // Verify 2FA code
  public async verify2FA(userId: string, code: string) {
    const user = await User.findById(userId);
    if (!user || !user.security.twoFactorEnabled) {
      throw new AppError('2FA not enabled', 400);
    }

    // Verify code based on method
    // This is a placeholder - implement actual 2FA verification
    // For SMS/email, check Redis stored codes
    // For app, use TOTP verification

    return true;
  }
}
