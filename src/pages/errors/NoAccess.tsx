import { Link as RouterLink } from 'react-router';
import { Button, Stack, Typography } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import { landingPath } from 'routes/landing';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';

// Shown when the admin is signed in but does not hold the permission a page needs.
const NoAccess = () => {
  const { user } = useAuth();

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: 360,
        p: 3,
      }}
    >
      <IconifyIcon
        icon="material-symbols:lock-outline"
        sx={{ fontSize: 48, color: 'text.secondary' }}
      />
      <Typography variant="h5">You do not have access to this page</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Ask the master admin to give you the permission you need.
      </Typography>
      <Button
        component={RouterLink}
        to={user ? landingPath(user) : paths.root}
        variant="soft"
        color="neutral"
      >
        Back to start
      </Button>
    </Stack>
  );
};

export default NoAccess;
