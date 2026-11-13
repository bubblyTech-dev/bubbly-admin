import { PropsWithChildren, ReactNode } from 'react';
import { Alert, Box, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  // nothing to draw for this period
  empty?: boolean;
  // the small Export icon for this chart
  action?: ReactNode;
  // keep the body at least this tall while loading and when empty (default 260)
  height?: number;
}

// The frame around a chart or table: title, optional export icon, and the loading / empty / error states.
const ChartCard = ({
  title,
  subtitle,
  loading = false,
  error = '',
  onRetry,
  empty = false,
  action,
  height = 260,
  children,
}: PropsWithChildren<ChartCardProps>) => (
  <Paper sx={{ p: 3, height: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
    <Stack
      direction="row"
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>

    {error ? (
      <Stack
        spacing={1.5}
        sx={{ minHeight: height, justifyContent: 'center', alignItems: 'flex-start' }}
      >
        <Alert severity="error" sx={{ width: 1 }}>
          {error}
        </Alert>
        {onRetry && (
          <Button
            size="small"
            variant="outlined"
            onClick={onRetry}
            startIcon={
              <IconifyIcon icon="material-symbols:refresh-rounded" sx={{ fontSize: 18 }} />
            }
          >
            Try again
          </Button>
        )}
      </Stack>
    ) : loading ? (
      <Skeleton variant="rounded" width="100%" height={height} />
    ) : empty ? (
      <Stack
        sx={{
          minHeight: height,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          color: 'text.secondary',
        }}
      >
        <IconifyIcon icon="material-symbols:info-outline-rounded" sx={{ fontSize: 28 }} />
        <Typography variant="body2">No data for this period</Typography>
      </Stack>
    ) : (
      children
    )}
  </Paper>
);

export default ChartCard;
