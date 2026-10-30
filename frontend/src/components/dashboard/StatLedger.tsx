import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFormatCurrency } from '@/contexts/CurrencyContext';

export const StatLedger: React.FC<{ balanceVisible: boolean }> = ({ balanceVisible }) => {
  const fmtMoney = useFormatCurrency();

  return (
    <div className="col-span-full bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 shadow-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-200 dark:divide-ink-800">
        
        {/* Balance */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wide font-medium text-ink-500 dark:text-ink-400">Total Balance</span>
            <Wallet className="w-4 h-4 text-ink-400" />
          </div>
          <div className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-50 mb-1 tracking-tight">
            {balanceVisible ? fmtMoney(245800) : '••••••'}
          </div>
          <div className="text-sm text-brand-600 dark:text-brand-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 12.5% vs last month
          </div>
        </div>

        {/* Income */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wide font-medium text-ink-500 dark:text-ink-400">Monthly Income</span>
            <ArrowDownRight className="w-4 h-4 text-ink-400" />
          </div>
          <div className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-50 mb-1 tracking-tight">
            {balanceVisible ? fmtMoney(85000) : '••••••'}
          </div>
          <div className="text-sm text-brand-600 dark:text-brand-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 5.2% vs last month
          </div>
        </div>

        {/* Expenses */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wide font-medium text-ink-500 dark:text-ink-400">Monthly Expenses</span>
            <ArrowUpRight className="w-4 h-4 text-ink-400" />
          </div>
          <div className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-50 mb-1 tracking-tight">
            {balanceVisible ? fmtMoney(52300) : '••••••'}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> 3.1% vs last month
          </div>
        </div>

        {/* Savings */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wide font-medium text-ink-500 dark:text-ink-400">Savings Rate</span>
            <PiggyBank className="w-4 h-4 text-ink-400" />
          </div>
          <div className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-50 mb-1 tracking-tight">
            {balanceVisible ? '38.5%' : '••••••'}
          </div>
          <div className="text-sm text-brand-600 dark:text-brand-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 2.3% vs last month
          </div>
        </div>

      </div>
    </div>
  );
};
