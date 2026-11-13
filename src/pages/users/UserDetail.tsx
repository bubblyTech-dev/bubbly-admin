import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button, Paper, Stack, Tab, Tabs } from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { staffService } from 'services/staffService';
import { StaffUser } from 'types/staff';
import ConfirmDialog from 'components/common/ConfirmDialog';
import PageHeader from 'components/common/PageHeader';
import PageLoader from 'components/loading/PageLoader';
import StaffFormDialog from 'components/sections/staff/StaffFormDialog';
import ResetPasswordDialog from 'components/sections/staff/detail/ResetPasswordDialog';
import StaffDetailsTab from 'components/sections/staff/detail/StaffDetailsTab';
import StaffLoginHistoryTab from 'components/sections/staff/detail/StaffLoginHistoryTab';
import StaffPermissionsTab from 'components/sections/staff/detail/StaffPermissionsTab';
import StaffSessionsTab from 'components/sections/staff/detail/StaffSessionsTab';

const UserDetail = () => {
  const { uuid = '' } = useParams();
  const { user, hasPermission } = useAuth();

  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('details');
  const [editing, setEditing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setStaff(await staffService.get(uuid));
    } catch (err) {
      setError(parseApiError(err).message);
    }
  }, [uuid]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (status: 1 | 2) => {
    setWorking(true);
    setError('');
    try {
      setStaff(await staffService.setStatus(uuid, status));
      setConfirmDeactivate(false);
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setWorking(false);
  };

  const breadcrumb = [
    { label: 'Home', url: paths.root },
    { label: 'Users', url: paths.users },
    { label: staff?.name || 'Staff member', active: true },
  ];

  if (!staff) {
    return (
      <Stack direction="column" height={1}>
        <PageHeader title="Staff member" breadcrumb={breadcrumb} />
        <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
          {error ? <Alert severity="error">{error}</Alert> : <PageLoader sx={{ minHeight: 240 }} />}
        </Paper>
      </Stack>
    );
  }

  // you manage others here; your own account is changed under Account Settings
  const isSelf = user?.uuid === staff.uuid;
  const canEdit = hasPermission('users_access.edit');
  const canStatus = hasPermission('users_access.status') && !isSelf;
  const canReset = hasPermission('users_access.reset_password') && !isSelf;

  const tabs = [
    { value: 'details', label: 'Details', show: true },
    { value: 'permissions', label: 'Permissions', show: true },
    { value: 'sessions', label: 'Sessions', show: hasPermission('users_access.sessions') },
    { value: 'history', label: 'Login history', show: hasPermission('users_access.login_history') },
  ].filter((item) => item.show);

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title={staff.name || staff.email}
        breadcrumb={breadcrumb}
        actionComponent={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {canEdit && (
              <Button variant="soft" color="neutral" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            {canReset && (
              <Button variant="soft" color="neutral" onClick={() => setResetting(true)}>
                Set new password
              </Button>
            )}
            {canStatus &&
              (staff.status === 1 ? (
                <Button variant="soft" color="neutral" onClick={() => setConfirmDeactivate(true)}>
                  Deactivate
                </Button>
              ) : (
                <Button variant="contained" disabled={working} onClick={() => void setStatus(1)}>
                  Activate
                </Button>
              ))}
          </Stack>
        }
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {notice && (
            <Alert severity="success" onClose={() => setNotice('')}>
              {notice}
            </Alert>
          )}

          <Tabs
            value={tab}
            onChange={(_event, value) => setTab(value)}
            variant="scrollable"
            scrollButtons={false}
          >
            {tabs.map((item) => (
              <Tab key={item.value} value={item.value} label={item.label} />
            ))}
          </Tabs>

          {tab === 'details' && <StaffDetailsTab staff={staff} />}
          {tab === 'permissions' && <StaffPermissionsTab staff={staff} onSaved={setStaff} />}
          {tab === 'sessions' && <StaffSessionsTab staff={staff} />}
          {tab === 'history' && <StaffLoginHistoryTab staff={staff} />}
        </Stack>
      </Paper>

      <StaffFormDialog
        open={editing}
        staff={staff}
        onClose={() => setEditing(false)}
        onSaved={(saved) => {
          setStaff(saved);
          setEditing(false);
        }}
      />

      <ResetPasswordDialog
        open={resetting}
        staff={staff}
        onClose={() => setResetting(false)}
        onDone={() => {
          setResetting(false);
          setNotice(
            'Password updated. They were signed out everywhere and must change it at the next login.',
          );
          void load();
        }}
      />

      <ConfirmDialog
        open={confirmDeactivate}
        title="Deactivate staff member?"
        message={`${staff.name || staff.email} will be signed out everywhere and cannot log in until activated again.`}
        confirmLabel="Deactivate"
        loading={working}
        onConfirm={() => void setStatus(2)}
        onClose={() => setConfirmDeactivate(false)}
      />
    </Stack>
  );
};

export default UserDetail;
