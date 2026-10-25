// The browser's date-time input works with "2026-11-01T09:30" in the user's own time zone,
// the API works with ISO times (UTC). These two functions convert between them.

const pad = (value: number) => String(value).padStart(2, '0');

export const isoToLocalInput = (iso: string | null | undefined) => {
  if (!iso) return '';
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// empty input becomes null, which clears the date on the server
export const localInputToIso = (value: string) => (value ? new Date(value).toISOString() : null);

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '-';
