import { useEffect, useState } from 'react';
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
import { formatDate } from 'lib/format';
import { schoolPath } from 'routes/paths';
import { schoolService } from 'services/schoolService';
import { PageMeta, School, SchoolStatus } from 'types/school';
import FilterSelect from 'components/common/FilterSelect';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import SchoolStatusChip from './SchoolStatusChip';
import { schoolStatusLabel } from './schoolStatus';

const PER_PAGE = 15;

const SchoolsTable = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SchoolStatus | ''>('');
  const [page, setPage] = useState(1);

  const [schools, setSchools] = useState<School[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    schoolService
      .list({
        search: debouncedSearch.trim() || undefined,
        status: status || undefined,
        page,
        perPage: PER_PAGE,
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
  }, [debouncedSearch, status, page]);

  // a new search or filter starts again from the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  return (
    <Stack direction="column" spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <SearchField
          value={search}
          placeholder="Search name, contact, email or phone"
          onChange={setSearch}
        />
        <FilterSelect
          label="Status"
          value={status}
          options={(Object.keys(schoolStatusLabel) as unknown as SchoolStatus[]).map((value) => ({
            value,
            label: schoolStatusLabel[value],
          }))}
          onChange={(value) => setStatus(value === '' ? '' : (Number(value) as SchoolStatus))}
        />
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer>
        <Table sx={{ minWidth: 720 }}>
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
          <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
            {schools.map((school) => (
              <TableRow
                key={school.uuid}
                hover
                onClick={() => navigate(schoolPath(school.uuid))}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar
                      src={school.logo ?? undefined}
                      alt={school.name}
                      sx={{ width: 36, height: 36 }}
                    >
                      {school.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{school.name}</Typography>
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
                <TableCell>{formatDate(school.createdAt)}</TableCell>
                <RowActionsCell
                  actions={[{ label: 'View', onClick: () => navigate(schoolPath(school.uuid)) }]}
                />
              </TableRow>
            ))}
            {!loading && schools.length === 0 && (
              <TableEmptyRow colSpan={6} message="No schools found." />
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePager page={page} perPage={PER_PAGE} total={meta?.total ?? 0} onChange={setPage} />
    </Stack>
  );
};

export default SchoolsTable;
