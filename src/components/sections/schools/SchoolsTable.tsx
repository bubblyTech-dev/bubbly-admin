import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import paths, { schoolPath } from 'routes/paths';
import { schoolService } from 'services/schoolService';
import { PageMeta, School, SchoolStatus } from 'types/school';
import IconifyIcon from 'components/base/IconifyIcon';
import PageLoader from 'components/loading/PageLoader';
import SchoolStatusChip from './SchoolStatusChip';
import { schoolStatusLabel } from './schoolStatus';

const PER_PAGE_OPTIONS = [10, 25, 50];

const SchoolsTable = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<SchoolStatus | ''>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0]);

  const [schools, setSchools] = useState<School[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // wait until the person stops typing before asking the server
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    schoolService
      .list({
        search: query || undefined,
        status: status || undefined,
        page,
        perPage,
      })
      .then((result) => {
        if (!active) return;
        setSchools(result.data);
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
  }, [query, status, page, perPage]);

  const handleStatus = (e: ChangeEvent<HTMLInputElement>) => {
    setStatus(e.target.value === '' ? '' : (Number(e.target.value) as SchoolStatus));
    setPage(1);
  };

  return (
    <Stack direction="column" spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flex: 1 }}>
          <TextField
            id="school-search"
            type="search"
            placeholder="Search by name, contact, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: { sm: 340 }, width: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon
                      icon="material-symbols:search-rounded"
                      sx={{ fontSize: 20, color: 'text.secondary' }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            id="school-status-filter"
            label="Status"
            value={status}
            onChange={handleStatus}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {(Object.keys(schoolStatusLabel) as unknown as SchoolStatus[]).map((value) => (
              <MenuItem key={value} value={value}>
                {schoolStatusLabel[value]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {hasPermission('schools.create') && (
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            onClick={() => navigate(paths.schoolNew)}
            sx={{ flexShrink: 0 }}
          >
            Add school
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>School</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Added</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.map((school) => (
              <TableRow
                key={school.uuid}
                hover
                onClick={() => navigate(schoolPath(school.uuid))}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar src={school.logo ?? undefined} alt={school.name} variant="rounded">
                      {school.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {school.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {school.slug}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{school.contactName || '-'}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {school.contactEmail || school.contactPhone || ''}
                  </Typography>
                </TableCell>
                <TableCell>{school.city || '-'}</TableCell>
                <TableCell>
                  <SchoolStatusChip status={school.status} />
                </TableCell>
                <TableCell>{dayjs(school.createdAt).format('DD MMM YYYY')}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label="Open school"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(schoolPath(school.uuid));
                    }}
                  >
                    <IconifyIcon icon="material-symbols:edit-outline-rounded" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!loading && schools.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}
                  >
                    No schools found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {loading && <PageLoader sx={{ py: 6 }} />}
      </TableContainer>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            select
            size="small"
            id="school-per-page"
            label="Rows"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            sx={{ minWidth: 90 }}
          >
            {PER_PAGE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {meta?.total ?? 0} {meta?.total === 1 ? 'school' : 'schools'}
          </Typography>
        </Stack>

        {meta && meta.lastPage > 1 && (
          <Pagination
            count={meta.lastPage}
            page={meta.page}
            onChange={(_event, value) => setPage(value)}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default SchoolsTable;
