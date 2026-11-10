import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  Typography,
  badgeClasses,
  paperClasses,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { parseApiError } from 'lib/api';
import paths from 'routes/paths';
import { notificationService } from 'services/notificationService';
import { AdminNotification, AdminNotificationType } from 'types/adminNotifications';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import OutlinedBadge from 'components/styled/OutlinedBadge';

dayjs.extend(relativeTime);

// the bell refreshes itself this often while the browser tab is visible
const REFRESH_MS = 60000;

const ICONS: Record<AdminNotificationType, { icon: string; color: 'info' | 'error' | 'warning' }> =
  {
    inquiry: { icon: 'material-symbols:inbox-outline-rounded', color: 'info' },
    payment_failed: { icon: 'material-symbols:error-outline-rounded', color: 'error' },
    subscription_past_due: { icon: 'material-symbols:warning-outline-rounded', color: 'warning' },
  };

// where each kind of notification opens (the app's own routes, never a link from the server)
const ROUTES: Record<AdminNotificationType, string> = {
  inquiry: paths.inquiries,
  payment_failed: paths.payments,
  subscription_past_due: paths.subscriptions,
};

const NotificationMenu = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const load = useCallback(async () => {
    try {
      const result = await notificationService.list();
      setItems(result.items);
      setUnread(result.unreadCount);
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoaded(true);
  }, []);

  // once on load, then every minute while the tab is in front
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    void load();
  };

  const handleClose = () => setAnchorEl(null);

  const markAllRead = async () => {
    try {
      await notificationService.markSeen();
      setUnread(0);
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const openItem = (item: AdminNotification) => {
    handleClose();
    navigate(ROUTES[item.type] ?? item.link);
  };

  return (
    <>
      <Button
        color="neutral"
        variant="soft"
        shape="circle"
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <OutlinedBadge
          badgeContent={unread}
          max={99}
          color="error"
          invisible={unread === 0}
          sx={{
            [`& .${badgeClasses.badge}`]: {
              top: -2,
              right: -2,
              minWidth: 18,
              height: 18,
              fontSize: 11,
              fontWeight: 700,
            },
          }}
        >
          <IconifyIcon
            icon="material-symbols-light:notifications-outline-rounded"
            sx={{ fontSize: 22 }}
          />
        </OutlinedBadge>
      </Button>

      <Popover
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${paperClasses.root}`]: {
            width: 400,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 560,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}
        >
          <Typography variant="h6">Notifications</Typography>
          <Button
            size="small"
            variant="text"
            disabled={unread === 0}
            startIcon={<IconifyIcon icon="material-symbols:check-rounded" />}
            onClick={() => void markAllRead()}
          >
            Mark all as read
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mx: 3, mb: 1 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <SimpleBar disableHorizontal>
            {loaded && items.length === 0 && !error ? (
              <Stack sx={{ alignItems: 'center', px: 3, py: 6, gap: 1 }}>
                <IconifyIcon
                  icon="material-symbols:check-circle-outline-rounded"
                  sx={{ fontSize: 32, color: 'success.main' }}
                />
                <Typography variant="subtitle2">You are all caught up</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  New inquiries and failed payments will show up here.
                </Typography>
              </Stack>
            ) : (
              <List disablePadding>
                {items.map((item) => (
                  <ListItemButton
                    key={`${item.type}-${item.uuid}`}
                    onClick={() => openItem(item)}
                    sx={{ alignItems: 'flex-start', gap: 1, px: 3, py: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 'unset', mt: 0.5 }}>
                      <IconifyIcon
                        icon={ICONS[item.type]?.icon ?? ICONS.inquiry.icon}
                        sx={{ fontSize: 22, color: `${ICONS[item.type]?.color ?? 'info'}.main` }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          {item.subtitle ? `${item.subtitle} · ` : ''}
                          {dayjs(item.createdAt).fromNow()}
                        </>
                      }
                      slotProps={{
                        primary: { variant: 'subtitle2' },
                        secondary: { variant: 'caption' },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </SimpleBar>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationMenu;
