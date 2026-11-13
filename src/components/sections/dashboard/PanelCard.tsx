import { PropsWithChildren } from 'react';
import { Link as RouterLink } from 'react-router';
import { Button, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface PanelCardProps {
  title: string;
  subtitle?: string;
  // the page the "View all" link opens
  href?: string;
  empty?: boolean;
  emptyText?: string;
}

// The frame of the small list panels on the dashboard (activity, schools, payments, announcements).
const PanelCard = ({
  title,
  subtitle,
  href,
  empty = false,
  emptyText = 'Nothing here yet.',
  children,
}: PropsWithChildren<PanelCardProps>) => (
  <Paper sx={{ p: 3, height: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
    <Stack
      direction="row"
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
    >
      <div>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </div>
      {href && (
        <Button
          component={RouterLink}
          to={href}
          size="small"
          color="neutral"
          endIcon={
            <IconifyIcon icon="material-symbols:arrow-forward-rounded" sx={{ fontSize: 16 }} />
          }
        >
          View all
        </Button>
      )}
    </Stack>

    {empty ? (
      <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
        {emptyText}
      </Typography>
    ) : (
      <Stack direction="column" spacing={1.5}>
        {children}
      </Stack>
    )}
  </Paper>
);

export default PanelCard;
