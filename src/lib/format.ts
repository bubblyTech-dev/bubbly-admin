import dayjs from 'dayjs';
import { AnalyticsUnit } from 'types/analytics';

// '-' for an empty value, otherwise "25 Oct 2026, 14:30"
export const formatDateTime = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM YYYY, HH:mm') : '-';

export const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM YYYY') : '-';

// ---- numbers for analytics and reports ----
// Money arrives in paise. Indian grouping: 1,23,456 (see lib/money.ts for the plain rupee formatter).

const indian = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export const formatCount = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(value) ? '-' : indian.format(value);

export const formatPercent = (value: number | null | undefined, digits = 1) =>
  value === null || value === undefined || Number.isNaN(value)
    ? '-'
    : `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits }).format(value)}%`;

export const formatDays = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(value)
    ? '-'
    : `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)} ${value === 1 ? 'day' : 'days'}`;

// "₹1,23,456" from paise
export const formatRupeesFromPaise = (paise: number | null | undefined, withDecimals = false) =>
  paise === null || paise === undefined || Number.isNaN(paise)
    ? '-'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: withDecimals || paise % 100 !== 0 ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(paise / 100);

// "₹1.2K", "₹3.4L" (lakh), "₹5.6Cr" (crore) from paise: for chart axes and small cards
export const formatCompactRupees = (paise: number | null | undefined) => {
  if (paise === null || paise === undefined || Number.isNaN(paise)) return '-';
  const rupees = paise / 100;
  const sign = rupees < 0 ? '-' : '';
  const abs = Math.abs(rupees);
  const trim = (n: number) => n.toFixed(n >= 100 ? 0 : 1).replace(/\.0$/, '');

  if (abs >= 10_000_000) return `${sign}₹${trim(abs / 10_000_000)}Cr`;
  if (abs >= 100_000) return `${sign}₹${trim(abs / 100_000)}L`;
  if (abs >= 1_000) return `${sign}₹${trim(abs / 1_000)}K`;
  return `${sign}₹${trim(abs)}`;
};

export const formatByUnit = (
  value: number | null | undefined,
  unit: AnalyticsUnit = 'count',
  compact = false,
) => {
  switch (unit) {
    case 'money':
      return compact ? formatCompactRupees(value) : formatRupeesFromPaise(value);
    case 'percent':
      return formatPercent(value);
    case 'days':
      return formatDays(value);
    default:
      return formatCount(value);
  }
};

// Dates are shown in India time whatever the computer's timezone is.
const istDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const istDateTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// '2026-11-11' -> '11 Nov 2026' (no timezone shift for plain dates); a full timestamp -> IST
export const formatDateIST = (value?: string | null) => {
  if (!value) return '-';
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (plain) return `${plain[3]} ${MONTHS[Number(plain[2]) - 1]} ${plain[1]}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : istDate.format(date);
};

export const formatDateTimeIST = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : istDateTime.format(date).replace(',', '');
};
