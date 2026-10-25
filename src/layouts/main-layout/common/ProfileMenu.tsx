import { PropsWithChildren, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuItemProps,
  Stack,
  SxProps,
  Typography,
  listClasses,
  listItemIconClasses,
  paperClasses,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusAvatar from 'components/base/StatusAvatar';

interface ProfileMenuItemProps extends MenuItemProps {
  icon: string;
  href?: string;
  sx?: SxProps;
}

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email || 'Admin';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const menuButton = (
    <Button
      color="neutral"
      variant="text"
      shape="circle"
      onClick={handleClick}
      sx={{
        height: 44,
        width: 44,
      }}
    >
      <StatusAvatar
        alt={displayName}
        status="online"
        src={user?.profileImage ?? undefined}
        sx={{
          width: 40,
          height: 40,
          border: 2,
          borderColor: 'background.paper',
        }}
      />
    </Button>
  );
  return (
    <>
      {menuButton}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        sx={{
          [`& .${paperClasses.root}`]: { minWidth: 320 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <StatusAvatar
            status="online"
            alt={displayName}
            src={user?.profileImage ?? undefined}
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {displayName}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {user?.isMaster ? 'Master admin' : user?.email}
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="material-symbols:manage-accounts-outline-rounded"
            onClick={handleClose}
            href={paths.account}
          >
            Account Settings
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            onClick={() => {
              handleClose();
              void logout();
            }}
            icon="material-symbols:logout-rounded"
          >
            Sign Out
          </ProfileMenuItem>
        </Box>
      </Menu>
    </>
  );
};

const ProfileMenuItem = ({
  icon,
  onClick,
  children,
  href,
  sx,
}: PropsWithChildren<ProfileMenuItemProps>) => {
  const linkProps = href ? { component: Link, href, underline: 'none' } : {};
  return (
    <MenuItem onClick={onClick} {...linkProps} sx={{ gap: 1, ...sx }}>
      <ListItemIcon
        sx={{
          [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' },
        }}
      >
        <IconifyIcon icon={icon} sx={{ color: 'text.secondary' }} />
      </ListItemIcon>
      {children}
    </MenuItem>
  );
};

export default ProfileMenu;
