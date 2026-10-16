// src/contexts/CurrencyContext.tsx
// Global currency state with live exchange rates from open.er-api.com
// Supports fiat + major crypto (BTC, ETH, USDT)

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { setGlobalCurrency } from '@/utils/formatters';

// ─── Supported currencies ───
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
  type: 'fiat' | 'crypto';
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'KES', name: 'Kenyan Shilling',    symbol: 'KSh', flag: '🇰🇪', decimals: 0, type: 'fiat' },
  { code: 'USD', name: 'US Dollar',          symbol: '$',   flag: '🇺🇸', decimals: 2, type: 'fiat' },
  { code: 'EUR', name: 'Euro',               symbol: '€',   flag: '🇪🇺', decimals: 2, type: 'fiat' },
  { code: 'GBP', name: 'British Pound',      symbol: '£',   flag: '🇬🇧', decimals: 2, type: 'fiat' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R',   flag: '🇿🇦', decimals: 2, type: 'fiat' },
  { code: 'AED', name: 'UAE Dirham',         symbol: 'د.إ', flag: '🇦🇪', decimals: 2, type: 'fiat' },
  { code: 'CAD', name: 'Canadian Dollar',    symbol: 'C$',  flag: '🇨🇦', decimals: 2, type: 'fiat' },
  { code: 'AUD', name: 'Australian Dollar',  symbol: 'A$',  flag: '🇦🇺', decimals: 2, type: 'fiat' },
  { code: 'JPY', name: 'Japanese Yen',       symbol: '¥',   flag: '🇯🇵', decimals: 0, type: 'fiat' },
  { code: 'CHF', name: 'Swiss Franc',        symbol: 'CHF', flag: '🇨🇭', decimals: 2, type: 'fiat' },
  { code: 'SGD', name: 'Singapore Dollar',   symbol: 'S$',  flag: '🇸🇬', decimals: 2, type: 'fiat' },
  { code: 'INR', name: 'Indian Rupee',       symbol: '₹',   flag: '🇮🇳', decimals: 0, type: 'fiat' },
  { code: 'CNY', name: 'Chinese Yuan',       symbol: '¥',   flag: '🇨🇳', decimals: 2, type: 'fiat' },
  { code: 'NGN', name: 'Nigerian Naira',     symbol: '₦',   flag: '🇳🇬', decimals: 0, type: 'fiat' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿', decimals: 0, type: 'fiat' },
  { code: 'UGX', name: 'Ugandan Shilling',   symbol: 'USh', flag: '🇺🇬', decimals: 0, type: 'fiat' },
  { code: 'USDT', name: 'Tether',            symbol: '₮',   flag: '💵', decimals: 2, type: 'crypto' },
  { code: 'BTC',  name: 'Bitcoin',           symbol: '₿',   flag: '₿',  decimals: 6, type: 'crypto' },
  { code: 'ETH',  name: 'Ethereum',          symbol: 'Ξ',   flag: 'Ξ',  decimals: 6, type: 'crypto' },
];

const BASE_CURRENCY = 'KES';
const CACHE_KEY = 'thebase.fx.rates';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CachedRates {
  fetchedAt: number;
  base: string;
  rates: Record<string, number>;
}

interface CurrencyContextValue {
  currency: CurrencyInfo;
  setCurrencyCode: (code: string) => void;
  rates: Record<string, number>;
  loadingRates: boolean;
  lastUpdated: Date | null;
  format: (amountInKES: number, options?: { decimals?: number; compact?: boolean }) => string;
  convert: (amountInKES: number) => number;
  supportedCurrencies: CurrencyInfo[];
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// ─── Fallback rates (used if API fails) ───
const FALLBACK_RATES: Record<string, number> = {
  KES: 1,
  USD: 0.0077,
  EUR: 0.0071,
  GBP: 0.0061,
  ZAR: 0.14,
  AED: 0.028,
  CAD: 0.011,
  AUD: 0.012,
  JPY: 1.17,
  CHF: 0.0068,
  SGD: 0.010,
  INR: 0.65,
  CNY: 0.056,
  NGN: 12.5,
  TZS: 20.2,
  UGX: 28.5,
  USDT: 0.0077,
  BTC: 0.000000074,
  ETH: 0.0000022,
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyCode, setCurrencyCodeState] = useState<string>(() => {
    if (typeof window === 'undefined') return BASE_CURRENCY;
    return localStorage.getItem('thebase.currency') || BASE_CURRENCY;
  });

  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loadingRates, setLoadingRates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currency = useMemo(() => {
    return SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  }, [currencyCode]);

  // ─── Fetch rates ───
  const refreshRates = useCallback(async () => {
    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedRates = JSON.parse(cached);
        if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
          setRates({ ...FALLBACK_RATES, ...parsed.rates });
          setLastUpdated(new Date(parsed.fetchedAt));
          return;
        }
      }
    } catch {
      // Ignore cache errors
    }

    setLoadingRates(true);
    try {
      // Free tier, no API key required
      const res = await fetch('https://open.er-api.com/v6/latest/KES');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.result !== 'success') throw new Error('API error');

      const fetchedRates: Record<string, number> = {};
      SUPPORTED_CURRENCIES.forEach((c) => {
        if (c.type === 'fiat' && data.rates[c.code]) {
          fetchedRates[c.code] = data.rates[c.code];
        }
      });

      // For crypto, use a secondary source or fallback rates
      // (open.er-api.com doesn't provide crypto)
      const merged = { ...FALLBACK_RATES, ...fetchedRates };

      setRates(merged);
      setLastUpdated(new Date());

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          fetchedAt: Date.now(),
          base: BASE_CURRENCY,
          rates: merged,
        })
      );
    } catch (err) {
      console.warn('[CurrencyContext] Failed to fetch live rates, using fallback:', err);
      setRates(FALLBACK_RATES);
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  const setCurrencyCode = useCallback((code: string) => {
    // Non-urgent update: allows React to keep the UI responsive
    startTransition(() => {
      setCurrencyCodeState(code);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('thebase.currency', code);
    }
  }, []);

  const convert = useCallback(
    (amountInKES: number): number => {
      const rate = rates[currencyCode] ?? 1;
      return amountInKES * rate;
    },
    [currencyCode, rates]
  );

  const format = useCallback(
    (amountInKES: number, options?: { decimals?: number; compact?: boolean }): string => {
      const value = convert(amountInKES);
      const decimals = options?.decimals ?? currency.decimals;

      // Compact for large numbers (1.2M, 3.4K, etc.)
      if (options?.compact) {
        if (Math.abs(value) >= 1_000_000_000) return `${currency.symbol}${(value / 1_000_000_000).toFixed(1)}B`;
        if (Math.abs(value) >= 1_000_000) return `${currency.symbol}${(value / 1_000_000).toFixed(1)}M`;
        if (Math.abs(value) >= 1_000) return `${currency.symbol}${(value / 1_000).toFixed(1)}K`;
      }

      // Crypto with more decimals
      if (currency.type === 'crypto' && Math.abs(value) < 1) {
        return `${currency.symbol}${value.toFixed(decimals)}`;
      }

      // Standard formatting
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency.type === 'fiat' ? currency.code : 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
          .format(value)
          .replace('US$', currency.symbol); // Cosmetic fix
      } catch {
        return `${currency.symbol}${value.toFixed(decimals)}`;
      }
    },
    [convert, currency]
  );

  // ─── Sync selected currency + rate into global formatter state ───
  useEffect(() => {
    const rate = rates[currencyCode] ?? 1;
    setGlobalCurrency({
      code: currency.code,
      symbol: currency.symbol,
      rate,
      decimals: currency.decimals,
      type: currency.type,
    });
  }, [currency, currencyCode, rates]);

  const value: CurrencyContextValue = {
    currency,
    setCurrencyCode,
    rates,
    loadingRates,
    lastUpdated,
    format,
    convert,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    refreshRates,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};

/**
 * A hook that returns the currency-aware `format` function.
 * Calling this in a component makes it re-render whenever
 * the user switches currency (fixes the "only updates on refresh" bug).
 *
 * Usage:
 *   const format = useFormatCurrency();
 *   <span>{format(245800)}</span>
 */
export const useFormatCurrency = () => {
  const { format } = useCurrency();
  return format;
};

/**
 * A hook that just causes a re-render when the currency changes.
 * Useful for components that call the global `formatCurrency()` and
 * need to re-render when the currency updates.
 */
export const useCurrencyRerender = () => {
  const { currency, rates } = useCurrency();
  // Returning currency ensures the component re-renders on change
  return { currency, rates };
};
