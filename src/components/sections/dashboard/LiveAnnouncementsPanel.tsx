import { Chip, Stack, Typography } from '@mui/material';
import { formatDateIST } from 'lib/format';
import { LiveAnnouncement } from 'types/dashboard';
import PanelCard from './PanelCard';

const TYPE_COLOR: Record<number, 'info' | 'warning' | 'error'> = {
  1: 'info',
  2: 'warning',
  3: 'error',
};

const LiveAnnouncementsPanel = ({ rows }: { rows: LiveAnnouncement[] }) => (
  <PanelCard
    title="Live announcements"
    subtitle="Notices schools can see right now."
    href="/announcements"
    empty={rows.length === 0}
    emptyText="No announcement is live."
  >
    {rows.map((row) => (
      <Stack key={row.uuid} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {row.title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }} component="div">
            {row.endsAt ? `Ends ${formatDateIST(row.endsAt)}` : 'No end date'}
          </Typography>
        </div>
        <Chip
          size="small"
          variant="soft"
          color={TYPE_COLOR[row.type] ?? 'info'}
          label={row.typeLabel}
        />
      </Stack>
    ))}
  </PanelCard>
);

export default LiveAnnouncementsPanel;
