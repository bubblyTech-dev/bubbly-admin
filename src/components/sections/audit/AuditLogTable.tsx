import { useEffect, useState } from 'react';
import {
  Alert,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { parseApiError } from 'lib/api';
import { formatDateTime } from 'lib/format';
import { auditService } from 'services/auditService';
import { AuditLogEntry, PaginationMeta } from 'types/staff';
import IconifyIcon from 'components/base/IconifyIcon';
import TablePager from 'components/common/TablePager';
import AuditLogDetailDialog from './AuditLogDetailDialog';
import { auditActionOptions, auditEntityOptions } from './auditOptions';

const AuditLogTable = () => {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 15;

  const [rows, setRows] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    auditService
      .list({ search: debouncedSearch, action, entityType, from, to, page: page + 1, perPage })
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
  }, [debouncedSearch, action, entityType, from, to, page, perPage]);

  // any new filter starts again from the first page
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, action, entityType, from, to]);

  return (
    <Stack direction="column" spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search who or what"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { md: 260 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="material-symbols:search-rounded" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          {auditActionOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Record"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {auditEntityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          type="date"
          label="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Who</TableCell>
              <TableCell>What happened</TableCell>
              <TableCell>IP address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
            {rows.map((entry) => (
              <TableRow
                key={entry.uuid}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => setSelected(entry)}
              >
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {formatDateTime(entry.createdAt)}
                </TableCell>
                <TableCell>{entry.actorName || '-'}</TableCell>
                <TableCell>{entry.description || entry.action}</TableCell>
                <TableCell>{entry.ipAddress || '-'}</TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Nothing recorded for these filters.
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

      <AuditLogDetailDialog entry={selected} onClose={() => setSelected(null)} />
    </Stack>
  );
};

export default AuditLogTable;
