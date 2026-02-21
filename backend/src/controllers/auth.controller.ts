import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { AppError } from '@/middleware/errorHandler';
import { validate } from '@/middleware/validate';
import { body } from 'express-validator';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  // Validation rules
  public static registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/),
    body('firstName').notEmpty().trim().isLength({ max: 50 }),
    body('lastName').notEmpty().trim().isLength({ max: 50 }),
    body('phoneNumber').matches(/^(254|0)?[17]\d{8}$/),
    body('idNumber').optional().matches(/^\d{7,8}$/),
    body('kraPin').optional().matches(/^[A-Z]\d{9}[A-Z]$/),
    body('dateOfBirth').optional().isISO8601(),
  ];

  public static loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ];

  public static refreshTokenValidation = [
    body('refreshToken').notEmpty(),
  ];

  public static changePasswordValidation = [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/),
  ];

  public static forgotPasswordValidation = [
    body('email').isEmail().normalizeEmail(),
  ];

  public static resetPasswordValidation = [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/),
  ];

  public static verifyEmailValidation = [
    body('token').notEmpty(),
  ];

  public static verifyPhoneValidation = [
    body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  ];

  // Register
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceInfo = {
        deviceId: req.headers['x-device-id'],
        deviceName: req.headers['x-device-name'],
        deviceType: req.headers['x-device-type'],
        os: req.headers['x-device-os'],
        browser: req.headers['user-agent'],
        ip: req.ip
      };

      const result = await this.authService.register(req.body);
      
      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email and phone.',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Login
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      const deviceInfo = {
        deviceId: req.headers['x-device-id'],
        deviceName: req.headers['x-device-name'],
        deviceType: req.headers['x-device-type'],
        os: req.headers['x-device-os'],
        browser: req.headers['user-agent'],
        ip: req.ip,
        location: req.headers['x-location']
      };

      const result = await this.authService.login(email, password, deviceInfo);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Refresh token
  public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const deviceId = req.headers['x-device-id'] as string;

      const result = await this.authService.refreshAccessToken(refreshToken, deviceId);

      // Set new refresh token in cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout
  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      // Clear cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout from all devices
  public logoutAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      await this.authService.logoutAll(userId);

      // Clear cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out from all devices'
      });
    } catch (error) {
      next(error);
    }
  };

  // Change password
  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Forgot password
  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      await this.authService.forgotPassword(email);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link will be sent'
      });
    } catch (error) {
      next(error);
    }
  };

  // Reset password
  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;

      await this.authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify email
  public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;

      const user = await this.authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify phone
  public verifyPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { code } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await this.authService.verifyPhone(user.phoneNumber, code);

      res.json({
        success: true,
        message: 'Phone verified successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Resend verification email
  public resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      await this.authService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      next(error);
    }
  };

  // Resend phone verification
  public resendPhoneVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await this.authService.resendPhoneVerification(user.phoneNumber);

      res.json({
        success: true,
        message: 'Verification code sent'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get current user
  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user!.id)
        .select('-security.passwordHistory -security.securityQuestions');
      
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  // Update profile
  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updates = ['firstName', 'lastName', 'idNumber', 'kraPin', 'dateOfBirth'];
      const updateData: any = {};

      updates.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user!.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-security.passwordHistory -security.securityQuestions');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  // Update preferences
  public updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user!.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Update preferences
      user.preferences = {
        ...user.preferences,
        ...req.body
      };

      await user.save();

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: { preferences: user.preferences }
      });
    } catch (error) {
      next(error);
    }
  };

  // Enable 2FA
  public enable2FA = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { method } = req.body;
      const userId = req.user!.id;

      const result = await this.authService.enable2FA(userId, method);

      res.json({
        success: true,
        message: '2FA enabled successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Disable 2FA
  public disable2FA = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      await this.authService.disable2FA(userId);

      res.json({
        success: true,
        message: '2FA disabled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify 2FA
  public verify2FA = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { code } = req.body;

      const isValid = await this.authService.verify2FA(userId, code);

      if (!isValid) {
        throw new AppError('Invalid verification code', 400);
      }

      res.json({
        success: true,
        message: '2FA verification successful'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get devices
  public getDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user!.id).select('security.deviceHistory');

      res.json({
        success: true,
        data: { devices: user?.security.deviceHistory || [] }
      });
    } catch (error) {
      next(error);
    }
  };

  // Remove device
  public removeDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;

      const user = await User.findById(req.user!.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.security.deviceHistory = user.security.deviceHistory.filter(
        d => d.deviceId !== deviceId
      );

      await user.save();

      res.json({
        success: true,
        message: 'Device removed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Trust device
  public trustDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;

      const user = await User.findById(req.user!.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const device = user.security.deviceHistory.find(d => d.deviceId === deviceId);
      if (device) {
        device.isTrusted = true;
        user.security.trustedDevices.push(deviceId);
        await user.save();
      }

      res.json({
        success: true,
        message: 'Device trusted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
