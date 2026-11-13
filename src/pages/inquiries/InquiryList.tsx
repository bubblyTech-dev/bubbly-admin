import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { formatDate } from 'lib/format';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { inquiryService } from 'services/inquiryService';
import {
  INQUIRY_SOURCE_LABELS,
  INQUIRY_STATUS,
  INQUIRY_STATUS_LABELS,
  Inquiry,
  InquiryCounts,
  InquiryFilters,
  PageMeta,
} from 'types/inquiries';
import FilterSelect from 'components/common/FilterSelect';
import PageHeader from 'components/common/PageHeader';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import InquiryDrawer from 'components/sections/inquiries/InquiryDrawer';
import InquiryStatusChip from 'components/sections/inquiries/InquiryStatusChip';

const PER_PAGE = 15;

const EMPTY_FILTERS: InquiryFilters = { search: '', status: '', source: '', mine: false };

const InquiryList = () => {
  const { hasPermission } = useAuth();

  const [filters, setFilters] = useState<InquiryFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [counts, setCounts] = useState<InquiryCounts | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // wait a moment after typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, search }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [result, totals] = await Promise.all([
        inquiryService.list({
          search: filters.search,
          status: filters.status,
          source: filters.source,
          assignedTo: filters.mine ? 'me' : undefined,
          page,
          perPage: PER_PAGE,
        }),
        inquiryService.counts(),
      ]);
      setRows(result.data);
      setMeta(result.meta);
      setCounts(totals);
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    if (hasPermission('inquiries.view')) void load();
  }, [load, hasPermission]);

  const changeFilter = (changes: Partial<InquiryFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

  if (!hasPermission('inquiries.view')) {
    return (
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Alert severity="info">You do not have access to inquiries.</Alert>
      </Paper>
    );
  }

  const chipItems: { label: string; status: number | ''; count: number | undefined }[] = [
    { label: 'All', status: '', count: counts?.total },
    {
      label: INQUIRY_STATUS_LABELS[INQUIRY_STATUS.NEW],
      status: INQUIRY_STATUS.NEW,
      count: counts?.new,
    },
    {
      label: INQUIRY_STATUS_LABELS[INQUIRY_STATUS.IN_PROGRESS],
      status: INQUIRY_STATUS.IN_PROGRESS,
      count: counts?.inProgress,
    },
    {
      label: INQUIRY_STATUS_LABELS[INQUIRY_STATUS.RESOLVED],
      status: INQUIRY_STATUS.RESOLVED,
      count: counts?.resolved,
    },
    {
      label: INQUIRY_STATUS_LABELS[INQUIRY_STATUS.SPAM],
      status: INQUIRY_STATUS.SPAM,
      count: counts?.spam,
    },
  ];

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Inquiries"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Inquiries', active: true },
        ]}
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={3}>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {chipItems.map((item) => (
              <Chip
                key={item.label}
                clickable
                color={filters.status === item.status ? 'primary' : 'default'}
                variant={filters.status === item.status ? 'filled' : 'outlined'}
                label={`${item.label}${item.count === undefined ? '' : ` (${item.count})`}`}
                onClick={() => changeFilter({ status: item.status })}
                sx={{
                  height: 40,
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 'body2.fontSize',
                  '& .MuiChip-label': { px: 2.5 },
                }}
              />
            ))}
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' } }}
          >
            <SearchField
              value={search}
              placeholder="Search name, email, school or message"
              onChange={setSearch}
            />
            <FilterSelect
              label="Source"
              value={filters.source}
              allLabel="All sources"
              options={Object.entries(INQUIRY_SOURCE_LABELS).map(([value, label]) => ({
                value: Number(value),
                label,
              }))}
              onChange={(value) => changeFilter({ source: value === '' ? '' : Number(value) })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.mine}
                  onChange={(e) => changeFilter({ mine: e.target.checked })}
                />
              }
              label="Assigned to me"
            />
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <TableContainer>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>School</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned to</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
                {rows.map((row) => (
                  <TableRow
                    key={row.uuid}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelected(row.uuid)}
                  >
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: row.status === INQUIRY_STATUS.NEW ? 700 : 500 }}
                      >
                        {row.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.schoolName || '-'}</TableCell>
                    <TableCell>{INQUIRY_SOURCE_LABELS[row.source]}</TableCell>
                    <TableCell>
                      <InquiryStatusChip status={row.status} />
                    </TableCell>
                    <TableCell>
                      {row.assignedTo ? row.assignedTo.name || row.assignedTo.email : '-'}
                    </TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <RowActionsCell
                      actions={[{ label: 'View', onClick: () => setSelected(row.uuid) }]}
                    />
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableEmptyRow colSpan={7} message="No inquiries found." />
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePager page={page} perPage={PER_PAGE} total={meta?.total ?? 0} onChange={setPage} />
        </Stack>
      </Paper>

      <InquiryDrawer
        uuid={selected}
        onClose={() => setSelected(null)}
        onChanged={() => void load()}
      />
    </Stack>
  );
};

export default InquiryList;
