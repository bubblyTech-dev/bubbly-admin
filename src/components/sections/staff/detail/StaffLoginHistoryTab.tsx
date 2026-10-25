import { useEffect, useState } from 'react';
import {
  Alert,
  Chip,
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
import { LoginHistoryEntry, PaginationMeta, StaffUser } from 'types/staff';
import TablePager from 'components/common/TablePager';

const failureReasons: Record<number, string> = {
  1: 'Wrong password',
  2: 'Unknown email',
  3: 'Account inactive',
  4: 'Account locked',
};

const StaffLoginHistoryTab = ({ staff }: { staff: StaffUser }) => {
  const [page, setPage] = useState(0);
  const perPage = 15;
  const [rows, setRows] = useState<LoginHistoryEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    staffService
      .loginHistory(staff.uuid, page + 1, perPage)
      .then((result) => {
        if (!active) return;
        setRows(result.data);
        setMeta(result.meta);
      })
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [staff.uuid, page, perPage]);

  return (
    <Stack direction="column" spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer>
        <Table sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>IP address</TableCell>
              <TableCell>Browser</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
            {rows.map((entry) => (
              <TableRow key={entry.uuid}>
                <TableCell>{formatDateTime(entry.createdAt)}</TableCell>
                <TableCell>
                  {entry.result === 1 ? (
                    <Chip size="small" color="success" label="Success" />
                  ) : (
                    <Chip
                      size="small"
                      color="error"
                      label={entry.failureReason ? failureReasons[entry.failureReason] : 'Failed'}
                    />
                  )}
                </TableCell>
                <TableCell>{entry.ipAddress || '-'}</TableCell>
                <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.userAgent || '-'}
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No logins yet.
                </TableCell>
              </TableRow>
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
    </Stack>
  );
};

export default StaffLoginHistoryTab;
