import { MenuItem, Stack, TextField, Typography } from '@mui/material';
import { formatDateIST } from 'lib/format';
import { useAuth } from 'providers/AuthProvider';
import { RangeInfo } from 'types/analytics';
import { DashboardPreset } from 'types/dashboard';
import { greetingFor, todayLabel } from './relativeTime';

export const DASHBOARD_PRESETS: Array<{ value: DashboardPreset; label: string }> = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'this_quarter', label: 'This quarter' },
  { value: 'this_fiscal_year', label: 'This financial year' },
  { value: 'last_12_months', label: 'Last 12 months' },
];

interface DashboardHeaderProps {
  preset: DashboardPreset;
  onPreset: (preset: DashboardPreset) => void;
  range?: RangeInfo;
}

// "Good morning, Name", today's date and the range picker that drives this page only.
const DashboardHeader = ({ preset, onPreset, range }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const firstName = (user?.name || '').trim().split(/\s+/)[0];

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between' }}
    >
      <div>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {greetingFor()}
          {firstName ? `, ${firstName}` : ''}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {todayLabel()} · Here is how Bubbly is doing.
        </Typography>
      </div>

      <Stack
        direction="column"
        spacing={0.5}
        sx={{ alignItems: { xs: 'stretch', md: 'flex-end' } }}
      >
        <TextField
          select
          size="small"
          label="Period"
          value={preset}
          onChange={(e) => onPreset(e.target.value as DashboardPreset)}
          sx={{ minWidth: 220 }}
        >
          {DASHBOARD_PRESETS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        {range && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatDateIST(range.from)} to {formatDateIST(range.to)}
            {range.previous ? ` · compared with the previous ${range.previous.days} days` : ''}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default DashboardHeader;
