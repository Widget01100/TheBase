// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth';
import { rateLimiter } from '@/middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', rateLimiter, AuthController.registerValidation, authController.register);
router.post('/login', rateLimiter, AuthController.loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', rateLimiter, AuthController.forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', rateLimiter, AuthController.resetPasswordValidation, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', rateLimiter, authController.resendVerificationEmail);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/change-password', AuthController.changePasswordValidation, authController.changePassword);
router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);
router.put('/preferences', authController.updatePreferences);
router.post('/verify-phone', AuthController.verifyPhoneValidation, authController.verifyPhone);
router.post('/resend-phone', authController.resendPhoneVerification);
router.post('/2fa/enable', authController.enable2FA);
router.post('/2fa/disable', authController.disable2FA);
router.post('/2fa/verify', authController.verify2FA);
router.get('/devices', authController.getDevices);
router.delete('/devices/:deviceId', authController.removeDevice);
router.post('/devices/:deviceId/trust', authController.trustDevice);

export default router;
