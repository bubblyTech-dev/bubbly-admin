import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { formatDateTime } from 'lib/format';
import { staffService } from 'services/staffService';
import { StaffSession, StaffUser } from 'types/staff';
import ConfirmDialog from 'components/common/ConfirmDialog';
import TableEmptyRow from 'components/common/TableEmptyRow';
import PageLoader from 'components/loading/PageLoader';

// The devices a staff member is signed in on. Ending a session signs that device out at once.
const StaffSessionsTab = ({ staff }: { staff: StaffUser }) => {
  const [sessions, setSessions] = useState<StaffSession[] | null>(null);
  const [error, setError] = useState('');
  const [confirmAll, setConfirmAll] = useState(false);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setSessions(await staffService.sessions(staff.uuid));
    } catch (err) {
      setError(parseApiError(err).message);
    }
  }, [staff.uuid]);

  useEffect(() => {
    void load();
  }, [load]);

  const endOne = async (session: StaffSession) => {
    setError('');
    try {
      await staffService.revokeSession(staff.uuid, session.uuid);
      await load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const endAll = async () => {
    setWorking(true);
    setError('');
    try {
      await staffService.revokeAllSessions(staff.uuid);
      setConfirmAll(false);
      await load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setWorking(false);
  };

  if (!sessions)
    return error ? <Alert severity="error">{error}</Alert> : <PageLoader sx={{ minHeight: 200 }} />;

  return (
    <Stack direction="column" spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box>
        <Button
          variant="soft"
          color="neutral"
          disabled={sessions.length === 0}
          onClick={() => setConfirmAll(true)}
        >
          End all sessions
        </Button>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell>Device</TableCell>
              <TableCell>IP address</TableCell>
              <TableCell>Last used</TableCell>
              <TableCell>Signed in</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.uuid}>
                <TableCell>{session.deviceLabel || 'Unknown device'}</TableCell>
                <TableCell>{session.ipAddress || '-'}</TableCell>
                <TableCell>{formatDateTime(session.lastUsedAt)}</TableCell>
                <TableCell>{formatDateTime(session.createdAt)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="soft"
                    color="neutral"
                    onClick={() => void endOne(session)}
                  >
                    End session
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableEmptyRow colSpan={5} message="Not signed in anywhere." />
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirmAll}
        title="End all sessions?"
        message={`${staff.name || staff.email} will be signed out on every device.`}
        confirmLabel="End all"
        loading={working}
        onConfirm={() => void endAll()}
        onClose={() => setConfirmAll(false)}
      />
    </Stack>
  );
};

export default StaffSessionsTab;
