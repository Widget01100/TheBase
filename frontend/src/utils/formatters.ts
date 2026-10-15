// src/utils/formatters.ts
// Formatting utilities for The Base

/**
 * Format a number as Kenyan Shillings currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'KES',
  locale: string = 'en-KE'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format large numbers compactly (1.2K, 3.4M, etc.)
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Format a percentage value
 * Accepts either a decimal (0.25) or already-multiplied (25) value.
 * If value is <= 1, treats it as a decimal and multiplies by 100.
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  const percent = value <= 1 ? value * 100 : value;
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(decimals)}%`;
};

/**
 * Format a Kenyan phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(254|0)?(\d{9})$/);
  if (match) {
    const num = match[2];
    return `+254 ${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
  }
  return phone;
};

/**
 * Format an M-PESA receipt code
 */
export const formatMpesaCode = (code: string): string => {
  if (!code) return '';
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

/**
 * Format a file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format a duration in minutes
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

/**
 * Format an account number with spaces every 4 digits
 */
export const formatAccountNumber = (acc: string): string => {
  return acc.replace(/(\d{4})(?=\d)/g, '$1 ');
};

// Runtime anchor so Vite always emits this module
export const FORMATTERS_VERSION = '1.0.0';
