import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { Avatar, Chip, Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { formatByUnit } from 'lib/format';
import { AnalyticsUnit } from 'types/analytics';
import Sparkline from 'components/analytics/Sparkline';
import IconifyIcon from 'components/base/IconifyIcon';

interface DashboardKpiCardProps {
  label: string;
  icon: string;
  value?: number;
  unit?: AnalyticsUnit;
  change?: number | null;
  previous?: number | null;
  sparkline?: number[];
  // which direction is good news; 'down' paints a fall green (for example failed payments)
  goodWhen?: 'up' | 'down';
  // a short line under the number: a breakdown, a second figure, a window
  subline?: ReactNode;
  // makes the whole card a link to the page behind the number
  href?: string;
  loading?: boolean;
}

// The dashboard's KPI tile: one number, its change against the previous period, a line of detail and a trend.
const DashboardKpiCard = ({
  label,
  icon,
  value,
  unit = 'count',
  change = null,
  previous = null,
  sparkline,
  goodWhen = 'up',
  subline,
  href,
  loading = false,
}: DashboardKpiCardProps) => {
  const direction = change === null ? 'flat' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const good = direction === 'flat' ? null : direction === goodWhen;
  const color = good === null ? 'neutral' : good ? 'success' : 'error';
  const arrow =
    direction === 'up'
      ? 'material-symbols:trending-up-rounded'
      : direction === 'down'
        ? 'material-symbols:trending-down-rounded'
        : 'material-symbols:trending-flat-rounded';

  const link = href ? { component: RouterLink, to: href } : {};

  return (
    <Paper
      {...link}
      sx={{
        p: 3,
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        minWidth: 0,
        color: 'inherit',
        textDecoration: 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...(href && { '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' } }),
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }} noWrap>
          {label}
        </Typography>
        <Avatar
          variant="rounded"
          sx={{ width: 34, height: 34, bgcolor: 'primary.lighter', borderRadius: 2 }}
        >
          <IconifyIcon icon={icon} sx={{ fontSize: 20, color: 'primary.main' }} />
        </Avatar>
      </Stack>

      {loading ? (
        <>
          <Skeleton variant="text" width="55%" height={44} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rounded" width="100%" height={32} />
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
                  label={change === null ? 'New' : `${change > 0 ? '+' : ''}${change}%`}
                  sx={{ fontWeight: 700 }}
                />
              </Tooltip>
            )}
          </Stack>
          {subline && (
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
              {subline}
            </Typography>
          )}
          {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} height={32} />}
        </>
      )}
    </Paper>
  );
};

export default DashboardKpiCard;
