// src/components/shared/EmptyState.tsx
// Beautiful, reusable empty state with icon, title, description, and CTA

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: 'circle' | 'square';
  color?: 'primary' | 'green' | 'blue' | 'purple' | 'amber' | 'red';
  className?: string;
}

const colorMap = {
  primary: { bg: 'bg-primary-100 dark:bg-primary-900/20', fg: 'text-primary-600 dark:text-primary-400' },
  green:   { bg: 'bg-green-100 dark:bg-green-900/20',     fg: 'text-green-600 dark:text-green-400' },
  blue:    { bg: 'bg-blue-100 dark:bg-blue-900/20',       fg: 'text-brand-600 dark:text-brand-600' },
  purple:  { bg: 'bg-purple-100 dark:bg-purple-900/20',   fg: 'text-purple-600 dark:text-purple-400' },
  amber:   { bg: 'bg-amber-100 dark:bg-amber-900/20',     fg: 'text-amber-600 dark:text-amber-400' },
  red:     { bg: 'bg-red-100 dark:bg-red-900/20',         fg: 'text-red-600 dark:text-red-400' },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration = 'circle',
  color = 'primary',
  className,
}) => {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'mb-6 flex items-center justify-center relative',
          illustration === 'circle' ? 'rounded-full w-24 h-24' : 'rounded-xl w-24 h-24',
          colors.bg
        )}
      >
        <Icon size={44} className={colors.fg} strokeWidth={1.5} />

        {/* Decorative pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            'absolute inset-0 border-2',
            illustration === 'circle' ? 'rounded-full' : 'rounded-xl',
            colors.fg,
            'opacity-30'
          )}
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-xl font-bold text-ink-900 dark:text-ink-50 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-ink-500 dark:text-ink-400 max-w-sm mb-6 leading-relaxed"
      >
        {description}
      </motion.p>

      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3"
        >
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="ghost" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
