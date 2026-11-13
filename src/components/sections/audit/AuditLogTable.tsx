import { useEffect, useState } from 'react';
import {
  Alert,
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
import FilterSelect from 'components/common/FilterSelect';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
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
        <SearchField value={search} placeholder="Search who or what" onChange={setSearch} />
        <FilterSelect
          label="Action"
          value={action}
          allLabel={auditActionOptions.find((option) => option.value === '')?.label}
          options={auditActionOptions.filter((option) => option.value !== '')}
          onChange={setAction}
        />
        <FilterSelect
          label="Record"
          value={entityType}
          allLabel={auditEntityOptions.find((option) => option.value === '')?.label}
          options={auditEntityOptions.filter((option) => option.value !== '')}
          onChange={setEntityType}
        />
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
              <TableCell align="right" />
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
                <RowActionsCell
                  actions={[{ label: 'View details', onClick: () => setSelected(entry) }]}
                />
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableEmptyRow colSpan={5} message="Nothing recorded for these filters." />
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
