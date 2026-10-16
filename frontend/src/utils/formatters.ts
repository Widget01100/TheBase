// src/utils/formatters.ts
// Global currency-aware formatters
//
// `formatCurrency` reads from module-level state that's kept in sync with
// the CurrencyContext. Every existing call to `formatCurrency(amount)`
// automatically respects the selected currency — no hooks, no prop drilling.

// ─── Global currency state ───
interface CurrencyState {
  code: string;
  symbol: string;
  rate: number;      // multiplier from KES (base) to this currency
  decimals: number;
  type: 'fiat' | 'crypto';
}

let currentCurrency: CurrencyState = {
  code: 'KES',
  symbol: 'KSh',
  rate: 1,
  decimals: 0,
  type: 'fiat',
};

/** Called by CurrencyContext whenever the user picks a new currency. */
export function setGlobalCurrency(state: CurrencyState): void {
  currentCurrency = state;
}

export function getGlobalCurrency(): CurrencyState {
  return currentCurrency;
}

// ─── formatCurrency ───
// Input is always in KES (the base unit). Output uses the selected currency.
export const formatCurrency = (
  amountInKES: number,
  _currency?: string,   // kept for backwards compat
  _locale?: string,     // kept for backwards compat
): string => {
  const { symbol, rate, decimals, type } = currentCurrency;
  const converted = amountInKES * rate;

  // Crypto: show more decimals for small values
  if (type === 'crypto' && Math.abs(converted) < 1) {
    return `${symbol}${converted.toFixed(decimals)}`;
  }

  // Fiat + USDT
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(converted);

    // Symbol prefix — consistent across all currencies
    return `${symbol}${formatted}`;
  } catch {
    return `${symbol}${converted.toFixed(decimals)}`;
  }
};

// ─── formatCurrencyCompact ───
// Same as formatCurrency but produces "KSh245.8K" / "$1.9K" / "₿0.0000183"
export const formatCurrencyCompact = (amountInKES: number): string => {
  const { symbol, rate, decimals, type } = currentCurrency;
  const converted = amountInKES * rate;

  if (type === 'crypto' && Math.abs(converted) < 1) {
    return `${symbol}${converted.toFixed(decimals)}`;
  }

  if (Math.abs(converted) >= 1_000_000_000) {
    return `${symbol}${(converted / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(converted) >= 1_000_000) {
    return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(converted) >= 1_000) {
    return `${symbol}${(converted / 1_000).toFixed(1)}K`;
  }
  return `${symbol}${converted.toFixed(0)}`;
};

// ─── Other formatters (unchanged from before) ───
export const formatCompactNumber = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  const percent = value <= 1 ? value * 100 : value;
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(decimals)}%`;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(254|0)?(\d{9})$/);
  if (match) {
    const num = match[2];
    return `+254 ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
  }
  return phone;
};

export const formatMpesaCode = (code: string): string => {
  if (!code) return '';
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const formatAccountNumber = (acc: string): string => {
  return acc.replace(/(\d{4})(?=\d)/g, '$1 ');
};

// Runtime anchor for Vite
export const FORMATTERS_VERSION = '2.0.0';
