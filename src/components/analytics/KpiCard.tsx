import { Avatar, Chip, Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { formatByUnit } from 'lib/format';
import { AnalyticsUnit } from 'types/analytics';
import IconifyIcon from 'components/base/IconifyIcon';
import Sparkline from './Sparkline';

interface KpiCardProps {
  label: string;
  value?: number;
  unit?: AnalyticsUnit;
  // the change against the previous period in percent (null when there is nothing to compare)
  change?: number | null;
  previous?: number | null;
  sparkline?: number[];
  icon?: string;
  // which direction is good news; 'down' paints a fall green (for example failed payments)
  goodWhen?: 'up' | 'down';
  loading?: boolean;
}

// One number with its change against the previous period and a small trend line.
const KpiCard = ({
  label,
  value,
  unit = 'count',
  change = null,
  previous = null,
  sparkline,
  icon,
  goodWhen = 'up',
  loading = false,
}: KpiCardProps) => {
  const direction = change === null ? 'flat' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const good = direction === 'flat' ? null : direction === goodWhen;
  const color = good === null ? 'neutral' : good ? 'success' : 'error';
  const arrow =
    direction === 'up'
      ? 'material-symbols:trending-up-rounded'
      : direction === 'down'
        ? 'material-symbols:trending-down-rounded'
        : 'material-symbols:trending-flat-rounded';

  return (
    <Paper
      sx={{ p: 3, height: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }} noWrap>
          {label}
        </Typography>
        {icon && (
          <Avatar
            variant="rounded"
            sx={{ width: 34, height: 34, bgcolor: 'primary.lighter', borderRadius: 2 }}
          >
            <IconifyIcon icon={icon} sx={{ fontSize: 20, color: 'primary.main' }} />
          </Avatar>
        )}
      </Stack>

      {loading ? (
        <>
          <Skeleton variant="text" width="55%" height={44} />
          <Skeleton variant="rounded" width="100%" height={36} />
        </>
      ) : (
        <>
          <Stack direction="row" sx={{ alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {formatByUnit(value, unit)}
            </Typography>
            {previous !== null && (
              <Tooltip title={`Previous period: ${formatByUnit(previous, unit)}`}>
                <Chip
                  size="small"
                  color={color}
                  variant="soft"
                  icon={<IconifyIcon icon={arrow} sx={{ fontSize: 16 }} />}
                  label={change === null ? 'No change data' : `${change > 0 ? '+' : ''}${change}%`}
                  sx={{ fontWeight: 700 }}
                />
              </Tooltip>
            )}
          </Stack>
          {previous !== null && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: -0.5 }}>
              vs previous period
            </Typography>
          )}
          {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} />}
        </>
      )}
    </Paper>
  );
};

export default KpiCard;
