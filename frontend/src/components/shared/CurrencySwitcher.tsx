// src/components/shared/CurrencySwitcher.tsx
// Global currency dropdown — changes propagate everywhere

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, DollarSign, RefreshCw } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface CurrencySwitcherProps {
  variant?: 'compact' | 'full';
}

const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ variant = 'full' }) => {
  const { currency, setCurrencyCode, supportedCurrencies, loadingRates, lastUpdated, refreshRates } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const filtered = supportedCurrencies.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const fiat = filtered.filter((c) => c.type === 'fiat');
  const crypto = filtered.filter((c) => c.type === 'crypto');

  return (
    <div className="relative" ref={ref} style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 150ms' }}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl transition-colors',
          'bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700',
          'hover:border-primary-400 dark:hover:border-primary-500',
          variant === 'compact' ? 'text-sm' : 'text-sm font-medium'
        )}
      >
        <span className="text-lg leading-none">{currency.flag}</span>
        <span className="font-semibold">{currency.code}</span>
        {variant === 'full' && (
          <span className="text-ink-500 dark:text-ink-400 hidden sm:inline">{currency.symbol}</span>
        )}
        {loadingRates && <RefreshCw size={12} className="animate-spin text-primary-500" />}
        <ChevronDown
          size={14}
          className={cn('text-ink-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-ink-50 dark:bg-ink-900 rounded-xl shadow-2xl border border-ink-200 dark:border-ink-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-ink-200 dark:border-ink-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-ink-900 dark:text-ink-50">Currency</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); refreshRates(); }}
                  className="p-1 hover:bg-ink-100 dark:hover:bg-gray-800 rounded"
                  title="Refresh rates"
                >
                  <RefreshCw size={14} className={cn('text-ink-500', loadingRates && 'animate-spin')} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search currencies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-ink-100 dark:bg-ink-800 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 text-ink-900 dark:text-ink-50 placeholder:text-ink-500"
              />
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {fiat.length > 0 && (
                <>
                  <div className="px-4 py-2 text-[10px] font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wider bg-ink-50 dark:bg-ink-800/50">
                    Fiat
                  </div>
                  {fiat.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        startTransition(() => setCurrencyCode(c.code));
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-ink-900 dark:text-ink-50">{c.code}</div>
                        <div className="text-xs text-ink-500 dark:text-ink-400">{c.name}</div>
                      </div>
                      <span className="text-sm text-ink-400">{c.symbol}</span>
                      {c.code === currency.code && (
                        <Check size={14} className="text-primary-500" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </>
              )}

              {crypto.length > 0 && (
                <>
                  <div className="px-4 py-2 text-[10px] font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wider bg-ink-50 dark:bg-ink-800/50">
                    Crypto
                  </div>
                  {crypto.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        startTransition(() => setCurrencyCode(c.code));
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-ink-900 dark:text-ink-50">{c.code}</div>
                        <div className="text-xs text-ink-500 dark:text-ink-400">{c.name}</div>
                      </div>
                      <span className="text-sm text-ink-400">{c.symbol}</span>
                      {c.code === currency.code && (
                        <Check size={14} className="text-primary-500" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </>
              )}

              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-ink-500">
                  No currencies match "{search}"
                </div>
              )}
            </div>

            {/* Footer */}
            {lastUpdated && (
              <div className="px-4 py-2 border-t border-ink-200 dark:border-ink-800 text-[10px] text-ink-500 dark:text-ink-400">
                Rates updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySwitcher;
