// src/utils/contributionData.ts
// Build DailyActivity[] from real transactions
// Uses the canonical DailyActivity + Transaction types from @/types

import { eachDayOfInterval, startOfYear, endOfYear, format } from 'date-fns';
import type { DailyActivity, Transaction } from '@/types';

/**
 * Compute intensity (0-4) from transaction count relative to the year's max.
 * 0 = no activity
 * 1 = up to 25% of max
 * 2 = up to 50% of max
 * 3 = up to 75% of max
 * 4 = top quartile
 */
function computeIntensity(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

/**
 * Build the full year's DailyActivity array from real transactions.
 * Returns one entry per day of the given year.
 */
export function buildContributionData(
  transactions: Transaction[],
  year: number
): DailyActivity[] {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(start);
  const allDays = eachDayOfInterval({ start, end });

  // Group transactions by YYYY-MM-DD
  const byDate = new Map<string, Transaction[]>();
  transactions.forEach((t) => {
    const key = format(new Date(t.date), 'yyyy-MM-dd');
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(t);
  });

  // Find max count for intensity scaling
  const maxCount = Math.max(
    1,
    ...[...byDate.values()].map((txs) => txs.length)
  );

  return allDays.map((date) => {
    const key = format(date, 'yyyy-MM-dd');
    const txs = byDate.get(key) || [];
    const count = txs.length;

    const hasSavings = txs.some(
      (t) =>
        t.type === 'saving' ||
        (t.category && t.category.toLowerCase().includes('saving'))
    );
    const hasInvestment = txs.some(
      (t) =>
        t.type === 'investment' ||
        (t.category && t.category.toLowerCase().includes('investment'))
    );

    return {
      date,
      count,
      intensity: computeIntensity(count, maxCount),
      transactions: txs,
      hasSavings,
      hasInvestment,
    };
  });
}
