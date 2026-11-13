import { Chip, Stack, Typography } from '@mui/material';
import { formatRupeesFromPaise } from 'lib/format';
import { LatestPayment } from 'types/dashboard';
import PanelCard from './PanelCard';
import { relativeTime } from './relativeTime';

const statusColor = (status: number): 'success' | 'error' | 'warning' | 'neutral' => {
  if (status === 3) return 'success';
  if (status === 4) return 'error';
  if (status === 5 || status === 6) return 'warning';
  return 'neutral';
};

const LatestPaymentsPanel = ({ rows }: { rows: LatestPayment[] }) => (
  <PanelCard
    title="Latest payments"
    subtitle="Money coming in, online and offline."
    href="/payments"
    empty={rows.length === 0}
    emptyText="No payments yet."
  >
    {rows.map((row) => (
      <Stack key={row.uuid} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {row.schoolName || 'Unknown school'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }} component="div">
            {relativeTime(row.at)}
            {row.source === 'offline' ? ' · Offline' : ''}
          </Typography>
        </div>
        <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {formatRupeesFromPaise(row.amountPaise)}
        </Typography>
        <Chip size="small" variant="soft" color={statusColor(row.status)} label={row.statusLabel} />
      </Stack>
    ))}
  </PanelCard>
);

export default LatestPaymentsPanel;
