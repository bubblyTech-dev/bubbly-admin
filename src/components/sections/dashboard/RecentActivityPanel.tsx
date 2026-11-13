import { Avatar, Stack, Typography } from '@mui/material';
import { ActivityRow } from 'types/dashboard';
import IconifyIcon from 'components/base/IconifyIcon';
import PanelCard from './PanelCard';
import { relativeTime } from './relativeTime';

const RecentActivityPanel = ({ rows }: { rows: ActivityRow[] }) => (
  <PanelCard
    title="Recent activity"
    subtitle="The latest changes made by your team."
    href="/audit-logs"
    empty={rows.length === 0}
    emptyText="No activity recorded yet."
  >
    {rows.map((row) => (
      <Stack key={row.uuid} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Avatar
          variant="rounded"
          sx={{ width: 32, height: 32, bgcolor: 'background.elevation2', borderRadius: 2 }}
        >
          <IconifyIcon
            icon="material-symbols:history-rounded"
            sx={{ fontSize: 18, color: 'text.secondary' }}
          />
        </Avatar>
        <div>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.text}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.actorName || 'System'} · {relativeTime(row.createdAt)}
          </Typography>
        </div>
      </Stack>
    ))}
  </PanelCard>
);

export default RecentActivityPanel;
