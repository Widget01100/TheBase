// src/components/shared/Skeleton.tsx
// Shimmer skeleton loader for various content types

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  style,
}) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-800';

  const variantClass = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  }[variant];

  return <div className={cn(baseClass, variantClass, className)} style={style} />;
};

// ─── Pre-composed skeletons ───

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
      </div>
      <Skeleton variant="rounded" className="w-12 h-12" />
    </div>
    <div className="mt-4 flex items-center gap-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export const TransactionRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3">
    <div className="flex items-center space-x-3 flex-1">
      <Skeleton variant="rounded" className="w-10 h-10" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <Skeleton className="h-4 w-20" />
  </div>
);

export const ContributionGridSkeleton: React.FC = () => (
  <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-8 w-32" />
    </div>
    <div className="grid grid-cols-7 gap-1">
      {[...Array(98)].map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
    <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant="rounded" className="w-8 h-8" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-5 w-32" />
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rounded" className="w-10 h-7" />
        ))}
      </div>
    </div>
    <div className="h-64 flex items-end gap-2 px-4">
      {[...Array(12)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          className="flex-1"
          style={{ height: `${20 + Math.random() * 80}%` }}
        />
      ))}
    </div>
  </div>
);

export const NotificationSkeleton: React.FC = () => (
  <div className="flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
    <Skeleton variant="circular" className="w-2 h-2 mt-2" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export default Skeleton;
