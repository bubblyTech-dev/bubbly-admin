import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Paper, Stack } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import paths, { userPath } from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/common/PageHeader';
import StaffFormDialog from 'components/sections/staff/StaffFormDialog';
import StaffTable from 'components/sections/staff/StaffTable';

const UserList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [adding, setAdding] = useState(false);

  const refresh = () => setRefreshKey((key) => key + 1);

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="User & Access"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'User & Access', active: true },
        ]}
        actionComponent={
          hasPermission('users_access.create') ? (
            <Button
              variant="contained"
              startIcon={<IconifyIcon icon="material-symbols:person-add-outline-rounded" />}
              onClick={() => setAdding(true)}
            >
              Add staff
            </Button>
          ) : undefined
        }
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <StaffTable refreshKey={refreshKey} onChanged={refresh} />
      </Paper>

      <StaffFormDialog
        open={adding}
        staff={null}
        onClose={() => setAdding(false)}
        onSaved={(staff) => {
          setAdding(false);
          refresh();
          // the next step is choosing what they may do
          if (hasPermission('users_access.permissions')) navigate(userPath(staff.uuid));
        }}
      />
    </Stack>
  );
};

export default UserList;
