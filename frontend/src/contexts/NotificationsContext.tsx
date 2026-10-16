// src/contexts/NotificationsContext.tsx
// Global notifications state shared between the header dropdown and the /notifications page

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  Target,
  TrendingUp,
  Award,
  Smartphone,
  Zap,
  Shield,
  MessageSquare,
} from 'lucide-react';

export type NotificationType =
  | 'budget_alert'
  | 'goal_progress'
  | 'investment_update'
  | 'achievement_unlocked'
  | 'transaction_alert'
  | 'mpesa_sync'
  | 'system_update'
  | 'ai_insight';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  timestampMs: number;   // for sorting
  read: boolean;
  icon: any;
  color: string;
}

// ─── Initial seed data ───
// localStorage key for persistence
const STORAGE_KEY = 'thebase.notifications.v1';

// Load persisted notifications (falls back to seed data)
function loadPersistedNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_NOTIFICATIONS;

    const parsed = JSON.parse(raw) as AppNotification[];
    // Re-hydrate the `icon` field (functions aren't serializable)
    return parsed.map((n) => ({
      ...n,
      icon: resolveIcon(n.type),
    }));
  } catch (err) {
    console.warn('[NotificationsContext] Failed to load persisted notifications:', err);
    return INITIAL_NOTIFICATIONS;
  }
}

// Persist notifications to localStorage
function persistNotifications(notifications: AppNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    // Strip `icon` (functions aren't JSON-serializable)
    const serializable = notifications.map(({ icon, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (err) {
    console.warn('[NotificationsContext] Failed to persist notifications:', err);
  }
}

// Resolve an icon component from a notification type
function resolveIcon(type: NotificationType) {
  const map: Record<NotificationType, any> = {
    budget_alert: AlertCircle,
    goal_progress: Target,
    investment_update: TrendingUp,
    achievement_unlocked: Award,
    transaction_alert: Zap,
    mpesa_sync: Smartphone,
    system_update: Shield,
    ai_insight: MessageSquare,
  };
  return map[type];
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    type: 'budget_alert',
    title: '💰 Budget Alert',
    message: "You've used 80% of your Food budget (KSh 12,000 of KSh 15,000)",
    timestamp: '5 min ago',
    timestampMs: Date.now() - 5 * 60 * 1000,
    read: false,
    icon: AlertCircle,
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20',
  },
  {
    id: 2,
    type: 'goal_progress',
    title: '🎯 Goal Progress',
    message: "You're 50% to your Emergency Fund goal — keep going!",
    timestamp: '1 hour ago',
    timestampMs: Date.now() - 60 * 60 * 1000,
    read: false,
    icon: Target,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  },
  {
    id: 3,
    type: 'investment_update',
    title: '📈 Investment Update',
    message: 'Your CIC Money Market Fund earned KSh 1,200 this month',
    timestamp: '2 hours ago',
    timestampMs: Date.now() - 2 * 60 * 60 * 1000,
    read: false,
    icon: TrendingUp,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  },
  {
    id: 4,
    type: 'achievement_unlocked',
    title: '🏆 Achievement Unlocked!',
    message: 'You earned the "Saving Shark" badge for completing 12 weeks',
    timestamp: '5 hours ago',
    timestampMs: Date.now() - 5 * 60 * 60 * 1000,
    read: false,
    icon: Award,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  },
  {
    id: 5,
    type: 'mpesa_sync',
    title: '⚡ M-Pesa Sync',
    message: 'Synced 12 new transactions from your M-Pesa account',
    timestamp: '1 day ago',
    timestampMs: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    icon: Smartphone,
    color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  },
  {
    id: 6,
    type: 'transaction_alert',
    title: '💳 Large Transaction',
    message: 'A transaction of KSh 10,000 was made to CIC MMF Investment',
    timestamp: '2 days ago',
    timestampMs: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: true,
    icon: Zap,
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  },
  {
    id: 7,
    type: 'system_update',
    title: '🔐 Security Update',
    message: 'Your password was changed successfully',
    timestamp: '3 days ago',
    timestampMs: Date.now() - 3 * 24 * 60 * 60 * 1000,
    read: true,
    icon: Shield,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  },
  {
    id: 8,
    type: 'ai_insight',
    title: '💡 Malkia Insight',
    message: 'You could save KSh 3,500/month by enabling round-up savings',
    timestamp: '4 days ago',
    timestampMs: Date.now() - 4 * 24 * 60 * 60 * 1000,
    read: true,
    icon: MessageSquare,
    color: 'text-primary-600 bg-primary-100 dark:bg-primary-900/20',
  },
];

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markOneRead: (id: number) => void;
  markAllRead: () => void;
  deleteOne: (id: number) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestampMs' | 'timestamp' | 'read'>) => void;
  getRecent: (count?: number) => AppNotification[];
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadPersistedNotifications);

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    persistNotifications(notifications);
  }, [notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markOneRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteOne = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback(
    (notification: Omit<AppNotification, 'id' | 'timestampMs' | 'timestamp' | 'read'>) => {
      setNotifications((prev) => [
        {
          ...notification,
          id: Date.now(),
          timestamp: 'Just now',
          timestampMs: Date.now(),
          read: false,
        },
        ...prev,
      ]);
    },
    []
  );

  const getRecent = useCallback(
    (count: number = 5) => {
      return [...notifications]
        .sort((a, b) => b.timestampMs - a.timestampMs)
        .slice(0, count);
    },
    [notifications]
  );

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    markOneRead,
    markAllRead,
    deleteOne,
    clearAll,
    addNotification,
    getRecent,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
};
