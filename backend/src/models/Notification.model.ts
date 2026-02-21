import mongoose, { Document, Schema } from 'mongoose';
import { INotification, NotificationType, NotificationPriority } from '@/types';

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'budget_alert', 'goal_progress', 'investment_update',
      'transaction_alert', 'challenge_update', 'achievement_unlocked',
      'weekly_report', 'daily_summary', 'system_update',
      'security_alert', 'payment_reminder', 'ai_insight'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  delivered: {
    type: Boolean,
    default: false,
    index: true
  },
  deliveredAt: Date,
  actions: [{
    id: { type: String, required: true },
    label: { type: String, required: true },
    action: { type: String, required: true },
    url: String,
    data: Schema.Types.Mixed
  }],
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, priority: 1, read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now.getTime() - this.createdAt.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = async function() {
  this.delivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

// Static method to create a notification
notificationSchema.statics.createNotification = async function(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: any,
  priority: NotificationPriority = 'medium',
  actions?: any[],
  expiresIn?: number
) {
  const notification = await this.create({
    userId,
    type,
    title,
    body,
    data,
    priority,
    actions,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined
  });
  
  // Emit socket event for real-time notification
  const io = require('@/server').io;
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
  
  return notification;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId: string) {
  return this.countDocuments({ userId, read: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId: string) {
  return this.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );
};

// Static method to clean old notifications
notificationSchema.statics.cleanOld = async function(days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return this.deleteMany({
    read: true,
    createdAt: { $lt: cutoff }
  });
};

// Static method to create budget alert
notificationSchema.statics.createBudgetAlert = async function(
  userId: string,
  budget: any,
  percentage: number
) {
  return this.createNotification(
    userId,
    'budget_alert',
    'Budget Alert',
    `You've used ${percentage.toFixed(1)}% of your ${budget.name} budget`,
    { budgetId: budget._id, percentage },
    percentage >= 100 ? 'urgent' : 'high',
    [
      {
        id: 'view_budget',
        label: 'View Budget',
        action: 'navigate',
        url: `/budget/${budget._id}`
      },
      {
        id: 'adjust_budget',
        label: 'Adjust',
        action: 'navigate',
        url: `/budget/${budget._id}/edit`
      }
    ]
  );
};

// Static method to create goal progress notification
notificationSchema.statics.createGoalProgress = async function(
  userId: string,
  goal: any,
  progress: number
) {
  let title = 'Goal Progress';
  let priority: NotificationPriority = 'medium';
  
  if (progress >= 100) {
    title = '🎉 Goal Achieved!';
    priority = 'high';
  } else if (progress >= 75) {
    title = 'Almost There!';
    priority = 'medium';
  }
  
  return this.createNotification(
    userId,
    'goal_progress',
    title,
    `You're ${progress.toFixed(1)}% of the way to your ${goal.name} goal`,
    { goalId: goal._id, progress },
    priority,
    [
      {
        id: 'view_goal',
        label: 'View Goal',
        action: 'navigate',
        url: `/goals/${goal._id}`
      }
    ]
  );
};

// Static method to create achievement notification
notificationSchema.statics.createAchievementUnlocked = async function(
  userId: string,
  badge: any
) {
  return this.createNotification(
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
    ]
  );
};

// Static method to create investment update
notificationSchema.statics.createInvestmentUpdate = async function(
  userId: string,
  investment: any,
  change: number
) {
  const isPositive = change > 0;
  return this.createNotification(
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
};

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
