// src/pages/notifications/Notifications.tsx
// Full notifications page — reads from shared NotificationsContext

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Search,
  Award,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/shared/EmptyState';
import { NotificationSkeleton } from '@/components/shared/Skeleton';
import { useNotifications } from '@/contexts/NotificationsContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'updates', label: 'Updates' },
];

const Notifications: React.FC = () => {
  // ✅ Use shared context instead of local state
  const {
    notifications,
    unreadCount,
    markAllRead,
    markOneRead,
    deleteOne,
    clearAll,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);

  // Filter + search
  const filtered = useMemo(() => {
    let result = notifications;

    switch (activeFilter) {
      case 'unread':
        result = result.filter((n) => !n.read);
        break;
      case 'alerts':
        result = result.filter((n) =>
          ['budget_alert', 'transaction_alert', 'system_update'].includes(n.type)
        );
        break;
      case 'achievements':
        result = result.filter((n) => n.type === 'achievement_unlocked');
        break;
      case 'updates':
        result = result.filter((n) =>
          ['investment_update', 'mpesa_sync', 'ai_insight', 'goal_progress'].includes(n.type)
        );
        break;
      default:
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    return result;
  }, [notifications, activeFilter, searchQuery]);

  const handleMarkAllRead = () => {
    markAllRead();
    toast.success('All notifications marked as read');
  };

  const handleDeleteOne = (id: number) => {
    deleteOne(id);
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    clearAll();
    toast.success('All notifications cleared');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
            <Bell className="text-primary-600 dark:text-primary-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck size={16} />}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter + Search */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {FILTER_TABS.map((tab) => {
              let count = 0;
              if (tab.id === 'unread') count = unreadCount;
              else if (tab.id === 'all') count = notifications.length;
              else if (tab.id === 'alerts') {
                count = notifications.filter((n) =>
                  ['budget_alert', 'transaction_alert', 'system_update'].includes(n.type)
                ).length;
              } else if (tab.id === 'achievements') {
                count = notifications.filter((n) => n.type === 'achievement_unlocked').length;
              } else if (tab.id === 'updates') {
                count = notifications.filter((n) =>
                  ['investment_update', 'mpesa_sync', 'ai_insight', 'goal_progress'].includes(n.type)
                ).length;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
                    activeFilter === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                        activeFilter === tab.id
                          ? 'bg-white/20'
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Notifications list */}
      <Card variant="glass" className="overflow-hidden">
        {loading ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={notifications.length === 0 ? BellOff : Search}
            title={
              notifications.length === 0
                ? 'No notifications yet'
                : 'No notifications found'
            }
            description={
              notifications.length === 0
                ? "You're all caught up! We'll notify you when something important happens."
                : 'Try changing your filters or search query.'
            }
            actionLabel={
              notifications.length === 0 ? 'Back to Dashboard' : 'Clear filters'
            }
            onAction={() => {
              if (notifications.length === 0) {
                window.location.href = '/';
              } else {
                setActiveFilter('all');
                setSearchQuery('');
              }
            }}
            color={notifications.length === 0 ? 'green' : 'primary'}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((n, i) => {
              const Icon = n.icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors group',
                    !n.read && 'bg-primary-50/50 dark:bg-primary-900/10'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg shrink-0', n.color)}>
                    <Icon size={18} />
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => markOneRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      <h3
                        className={cn(
                          'text-sm',
                          n.read
                            ? 'text-gray-700 dark:text-gray-300 font-normal'
                            : 'text-gray-900 dark:text-white font-semibold'
                        )}
                      >
                        {n.title}
                      </h3>
                      {!n.read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                      {n.timestamp}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOne(n.id);
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </Card>
    </motion.div>
  );
};

export default Notifications;
