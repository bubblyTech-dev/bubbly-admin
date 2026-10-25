import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Avatar,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { parseApiError } from 'lib/api';
import { formatDateTime } from 'lib/format';
import { useAuth } from 'providers/AuthProvider';
import { userPath } from 'routes/paths';
import { staffService } from 'services/staffService';
import { PaginationMeta, StaffUser } from 'types/staff';
import ConfirmDialog from 'components/common/ConfirmDialog';
import FilterSelect from 'components/common/FilterSelect';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import StaffFormDialog from './StaffFormDialog';
import StaffStatusChip from './StaffStatusChip';

interface StaffTableProps {
  // changes when the page asks for a refresh (for example after a staff member was added)
  refreshKey: number;
  onChanged: () => void;
}

const StaffTable = ({ refreshKey, onChanged }: StaffTableProps) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const perPage = 15;

  const [rows, setRows] = useState<StaffUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [confirm, setConfirm] = useState<{
    kind: 'delete' | 'deactivate';
    staff: StaffUser;
  } | null>(null);
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState('');

  const debouncedSearch = useDebouncedValue(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await staffService.list({
        search: debouncedSearch,
        status,
        page: page + 1,
        perPage,
      });
      setRows(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [debouncedSearch, status, page, perPage, refreshKey]);

  useEffect(() => {
    void load();
  }, [load]);

  // a new search or filter starts again from the first page
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, status]);

  const activate = async (staff: StaffUser) => {
    setError('');
    try {
      await staffService.setStatus(staff.uuid, 1);
      onChanged();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    setWorking(true);
    setActionError('');
    try {
      if (confirm.kind === 'delete') await staffService.remove(confirm.staff.uuid);
      else await staffService.setStatus(confirm.staff.uuid, 2);
      setConfirm(null);
      onChanged();
    } catch (err) {
      setActionError(parseApiError(err).message);
    }
    setWorking(false);
  };

  const canEdit = hasPermission('users_access.edit');
  const canStatus = hasPermission('users_access.status');
  const canDelete = hasPermission('users_access.delete');

  return (
    <Stack direction="column" spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <SearchField
          value={search}
          placeholder="Search name, email or phone"
          onChange={setSearch}
        />
        <FilterSelect
          label="Status"
          value={status}
          options={[
            { value: 1, label: 'Active' },
            { value: 2, label: 'Inactive' },
            { value: 3, label: 'Locked' },
          ]}
          onChange={(value) => setStatus(value === '' ? '' : Number(value))}
        />
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last login</TableCell>
              <TableCell>Added</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
            {rows.map((staff) => (
              <TableRow
                key={staff.uuid}
                hover
                onClick={() => navigate(userPath(staff.uuid))}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar
                      src={staff.profileImage ?? undefined}
                      alt={staff.name ?? staff.email}
                      sx={{ width: 36, height: 36 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">{staff.name || '-'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {staff.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{staff.phone || '-'}</TableCell>
                <TableCell>
                  <StaffStatusChip status={staff.status} />
                </TableCell>
                <TableCell>{formatDateTime(staff.lastLoginAt)}</TableCell>
                <TableCell>{formatDateTime(staff.createdAt)}</TableCell>
                <RowActionsCell
                  actions={[
                    { label: 'View', onClick: () => navigate(userPath(staff.uuid)) },
                    { label: 'Edit', visible: canEdit, onClick: () => setEditing(staff) },
                    {
                      label: 'Deactivate',
                      visible: canStatus && staff.status === 1,
                      onClick: () => {
                        setActionError('');
                        setConfirm({ kind: 'deactivate', staff });
                      },
                    },
                    {
                      label: 'Activate',
                      visible: canStatus && staff.status !== 1,
                      onClick: () => void activate(staff),
                    },
                    {
                      label: 'Delete',
                      danger: true,
                      visible: canDelete,
                      onClick: () => {
                        setActionError('');
                        setConfirm({ kind: 'delete', staff });
                      },
                    },
                  ]}
                />
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableEmptyRow colSpan={6} message="No staff members found." />
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePager
        page={page + 1}
        perPage={perPage}
        total={meta?.total ?? 0}
        onChange={(next) => setPage(next - 1)}
      />

      <StaffFormDialog
        open={Boolean(editing)}
        staff={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          onChanged();
        }}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.kind === 'delete' ? 'Delete staff member?' : 'Deactivate staff member?'}
        message={
          confirm?.kind === 'delete'
            ? `${confirm.staff.name || confirm.staff.email} will be removed and signed out everywhere.`
            : `${confirm?.staff.name || confirm?.staff.email} will be signed out everywhere and cannot log in until activated again.`
        }
        confirmLabel={confirm?.kind === 'delete' ? 'Delete' : 'Deactivate'}
        color={confirm?.kind === 'delete' ? 'error' : 'primary'}
        loading={working}
        error={actionError}
        onConfirm={() => void runConfirmed()}
        onClose={() => setConfirm(null)}
      />
    </Stack>
  );
};

export default StaffTable;
