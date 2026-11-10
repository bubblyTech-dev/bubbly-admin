import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { schoolService } from 'services/schoolService';
import { SCHOOL_STATUS, School } from 'types/school';
import IconifyIcon from 'components/base/IconifyIcon';
import PageHeader from 'components/common/PageHeader';
import PageLoader from 'components/loading/PageLoader';
import SchoolForm from 'components/sections/schools/SchoolForm';
import SchoolNotes from 'components/sections/schools/SchoolNotes';
import SchoolStatusChip from 'components/sections/schools/SchoolStatusChip';
import SchoolStatusHistory from 'components/sections/schools/SchoolStatusHistory';
import StatusChangeDialog from 'components/sections/schools/StatusChangeDialog';
import SchoolSubscriptions from 'components/sections/subscriptions/SchoolSubscriptions';

type TabKey = 'overview' | 'subscription' | 'notes' | 'history';

const SchoolDetail = () => {
  const { uuid = '' } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [school, setSchool] = useState<School | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabKey>('overview');
  const [statusOpen, setStatusOpen] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let active = true;
    setSchool(null);
    setError('');

    schoolService
      .get(uuid)
      .then((result) => {
        if (active) setSchool(result);
      })
      .catch((err) => {
        if (active) setError(parseApiError(err).message);
      });

    return () => {
      active = false;
    };
  }, [uuid]);

  const handleDelete = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      await schoolService.remove(uuid);
      navigate(paths.schools, { replace: true });
    } catch (err) {
      setDeleteError(parseApiError(err).message);
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }
  if (!school) return <PageLoader sx={{ minHeight: 320 }} />;

  const canEdit = hasPermission('schools.edit');
  const canDelete = hasPermission('schools.delete') && school.status === SCHOOL_STATUS.ARCHIVED;

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title={school.name}
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Schools', url: paths.schools },
          { label: school.name, active: true },
        ]}
        actionComponent={
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <SchoolStatusChip status={school.status} />
            {hasPermission('schools.status') && (
              <Button variant="soft" color="neutral" onClick={() => setStatusOpen(true)}>
                Change status
              </Button>
            )}
            {canDelete && (
              <Button
                variant="soft"
                color="error"
                startIcon={<IconifyIcon icon="material-symbols:delete-outline-rounded" />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            )}
          </Stack>
        }
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Tabs value={tab} onChange={(_event, value: TabKey) => setTab(value)} sx={{ mb: 4 }}>
          <Tab value="overview" label="Overview" />
          {hasPermission('subscriptions.view') && <Tab value="subscription" label="Subscription" />}
          {hasPermission('schools.notes') && <Tab value="notes" label="Notes" />}
          <Tab value="history" label="Status history" />
        </Tabs>

        {tab === 'overview' && (
          <SchoolForm school={school} readOnly={!canEdit} onSaved={setSchool} />
        )}
        {tab === 'subscription' && (
          <SchoolSubscriptions schoolUuid={school.uuid} schoolName={school.name} />
        )}
        {tab === 'notes' && <SchoolNotes schoolUuid={school.uuid} />}
        {tab === 'history' && (
          <SchoolStatusHistory schoolUuid={school.uuid} refreshKey={historyKey} />
        )}
      </Paper>

      <StatusChangeDialog
        open={statusOpen}
        school={school}
        onClose={() => setStatusOpen(false)}
        onChanged={(changed) => {
          setSchool(changed);
          setHistoryKey((key) => key + 1);
        }}
      />

      <Dialog
        open={deleteOpen}
        onClose={deleting ? undefined : () => setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete school</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Delete {school.name}? It will no longer appear in the list.
          </DialogContentText>
          {deleteError && <Alert severity="error">{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="soft"
            color="neutral"
            onClick={() => setDeleteOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default SchoolDetail;
