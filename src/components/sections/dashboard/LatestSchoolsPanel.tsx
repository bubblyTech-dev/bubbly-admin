import { Link as RouterLink } from 'react-router';
import { Avatar, Chip, Stack, Typography } from '@mui/material';
import { schoolPath } from 'routes/paths';
import { LatestSchool } from 'types/dashboard';
import IconifyIcon from 'components/base/IconifyIcon';
import PanelCard from './PanelCard';
import { relativeTime } from './relativeTime';

const STATUS_COLOR: Record<number, 'success' | 'warning' | 'neutral'> = {
  1: 'success',
  2: 'warning',
  3: 'neutral',
};

const LatestSchoolsPanel = ({ rows }: { rows: LatestSchool[] }) => (
  <PanelCard
    title="Latest schools"
    subtitle="Newest schools on the platform."
    href="/schools"
    empty={rows.length === 0}
    emptyText="No schools yet."
  >
    {rows.map((row) => (
      <Stack
        key={row.uuid}
        component={RouterLink}
        to={schoolPath(row.uuid)}
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
      >
        <Avatar
          variant="rounded"
          sx={{ width: 36, height: 36, bgcolor: 'primary.lighter', borderRadius: 2 }}
        >
          <IconifyIcon
            icon="material-symbols:school-outline"
            sx={{ fontSize: 20, color: 'primary.main' }}
          />
        </Avatar>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {row.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
            {[row.city, row.planName].filter(Boolean).join(' · ') || 'No plan yet'} ·{' '}
            {relativeTime(row.createdAt)}
          </Typography>
        </div>
        <Chip
          size="small"
          variant="soft"
          color={STATUS_COLOR[row.status] ?? 'neutral'}
          label={row.statusLabel}
        />
      </Stack>
    ))}
  </PanelCard>
);

export default LatestSchoolsPanel;
