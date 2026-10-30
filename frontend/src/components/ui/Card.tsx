import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'premium' | 'mpesa' | 'gradient';
  glow?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  glow = false,
  interactive = false,
  className,
  onClick,
  style,
}) => {
  const variants = {
    default: 'bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800',
    glass: 'bg-ink-50/80 dark:bg-ink-900/80 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-ink-800/20',
    premium: 'bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-ink-800/20',
    mpesa: 'bg-gradient-to-br from-green-600 via-green-500 to-green-400 text-white',
    gradient: 'bg-ink-50 dark:bg-ink-900 text-white',
  };

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02, y: -5 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={cn(
        'rounded-lg shadow-lg transition-all duration-300',
        variants[variant],
        glow && 'shadow-glow',
        interactive && 'cursor-pointer hover:shadow-xl',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default Card;
