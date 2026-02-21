// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';
import goalRoutes from './goal.routes';
import budgetRoutes from './budget.routes';
import investmentRoutes from './investment.routes';
import challengeRoutes from './challenge.routes';
import mpesaRoutes from './mpesa.routes';
import aiCoachRoutes from './ai-coach.routes';
import reportRoutes from './report.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import webhookRoutes from './webhook.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '2.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/goals', goalRoutes);
router.use('/budgets', budgetRoutes);
router.use('/investments', investmentRoutes);
router.use('/challenges', challengeRoutes);
router.use('/mpesa', mpesaRoutes);
router.use('/ai-coach', aiCoachRoutes);
router.use('/reports', reportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/admin', adminRoutes);

export default router;
