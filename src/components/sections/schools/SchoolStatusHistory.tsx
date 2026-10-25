import { useEffect, useState } from 'react';
import {
  Alert,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { parseApiError } from 'lib/api';
import { schoolService } from 'services/schoolService';
import { PageMeta, SchoolStatusHistoryItem } from 'types/school';
import PageLoader from 'components/loading/PageLoader';
import SchoolStatusChip from './SchoolStatusChip';

const PER_PAGE = 10;

// Every suspend, reactivate and archive of a school, newest first.
// `refreshKey` changes after a status change so the list loads again.
const SchoolStatusHistory = ({
  schoolUuid,
  refreshKey,
}: {
  schoolUuid: string;
  refreshKey: number;
}) => {
  const [items, setItems] = useState<SchoolStatusHistoryItem[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    schoolService
      .statusHistory(schoolUuid, { page, perPage: PER_PAGE })
      .then((result) => {
        if (!active) return;
        setItems(result.data);
        setMeta(result.meta);
      })
      .catch((err) => {
        if (active) setError(parseApiError(err).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [schoolUuid, page, refreshKey]);

  return (
    <Stack direction="column" spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <PageLoader sx={{ py: 4 }} />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Change</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.uuid}>
                  <TableCell>{dayjs(item.createdAt).format('DD MMM YYYY, hh:mm A')}</TableCell>
                  <TableCell>
                    <Stack spacing={1} sx={{ alignItems: 'center' }}>
                      <SchoolStatusChip status={item.fromStatus} />
                      <Typography variant="body2">to</Typography>
                      <SchoolStatusChip status={item.toStatus} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>{item.reason}</TableCell>
                  <TableCell>{item.changedBy?.name || 'Unknown'}</TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}
                    >
                      The status has not been changed yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {meta && meta.lastPage > 1 && (
        <Pagination
          count={meta.lastPage}
          page={meta.page}
          onChange={(_event, value) => setPage(value)}
        />
      )}
    </Stack>
  );
};

export default SchoolStatusHistory;
