import { Link as RouterLink } from 'react-router';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';

interface QuickAction {
  label: string;
  icon: string;
  to: string;
  permission: string;
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Add school',
    icon: 'material-symbols:school-outline',
    to: paths.schoolNew,
    permission: 'schools.create',
  },
  {
    label: 'Add staff',
    icon: 'material-symbols:person-add-outline-rounded',
    to: paths.users,
    permission: 'users_access.create',
  },
  {
    label: 'New plan',
    icon: 'material-symbols:sell-outline',
    to: paths.plansNew,
    permission: 'plans.create',
  },
  {
    label: 'New announcement',
    icon: 'material-symbols:event-note-outline-rounded',
    to: paths.announcementNew,
    permission: 'announcements.manage',
  },
  {
    label: 'Record offline payment',
    icon: 'material-symbols:credit-card-outline',
    to: paths.payments,
    permission: 'billing.record_payment',
  },
];

// Shortcuts to the things an admin does most; only the ones this admin is allowed to do.
const QuickActionsCard = () => {
  const { hasPermission } = useAuth();
  const actions = ACTIONS.filter((action) => hasPermission(action.permission));
  if (actions.length === 0) return null;

  return (
    <Paper sx={{ p: 3, height: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <div>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Quick actions
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Shortcuts to what you do most.
        </Typography>
      </div>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
        {actions.map((action) => (
          <Button
            key={action.label}
            component={RouterLink}
            to={action.to}
            variant="outlined"
            color="neutral"
            startIcon={<IconifyIcon icon={action.icon} sx={{ fontSize: 20 }} />}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Paper>
  );
};

export default QuickActionsCard;
