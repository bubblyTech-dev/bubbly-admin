// Prices are stored in paise (100 paise = 1 rupee); the screens work in rupees.

export const paiseToRupees = (paise: number) => (paise / 100).toFixed(2);

// "499" or "499.50" -> 49900 / 49950. Returns null when the text is not a valid amount.
export const rupeesToPaise = (text: string): number | null => {
  const clean = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
};

export const formatRupees = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);

export const intervalLabel = (interval: number) => {
  if (interval === 2) return 'quarter';
  if (interval === 3) return 'year';
  return 'month';
};
