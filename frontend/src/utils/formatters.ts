export const formatCurrency = (
  amount: number,
  currency: string = 'KES',
  locale: string = 'en-KE'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
