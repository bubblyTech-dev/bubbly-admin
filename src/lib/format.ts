import dayjs from 'dayjs';

// '-' for an empty value, otherwise "25 Oct 2026, 14:30"
export const formatDateTime = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM YYYY, HH:mm') : '-';

export const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM YYYY') : '-';
