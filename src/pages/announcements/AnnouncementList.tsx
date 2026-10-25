import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Button,
  Paper,
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
import { formatDateTime } from 'lib/datetimeLocal';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { announcementService } from 'services/announcementService';
import {
  ANNOUNCEMENT_STATUS,
  Announcement,
  PageMeta,
  announcementStatusLabels,
  announcementTargetLabels,
  announcementTypeLabels,
} from 'types/announcements';
import IconifyIcon from 'components/base/IconifyIcon';
import ConfirmDialog from 'components/common/ConfirmDialog';
import FilterSelect from 'components/common/FilterSelect';
import PageHeader from 'components/common/PageHeader';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import {
  AnnouncementStatusChip,
  AnnouncementTypeChip,
} from 'components/sections/announcements/AnnouncementChips';

const AnnouncementList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('announcements.manage');

  const [rows, setRows] = useState<Announcement[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, perPage: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<Announcement | null>(null);
  const [busy, setBusy] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await announcementService.list({
        search: debouncedSearch.trim() || undefined,
        status: status ? Number(status) : undefined,
        type: type ? Number(type) : undefined,
        page,
        perPage,
      });
      setRows(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [debouncedSearch, status, type, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  // a new search or filter starts again from the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, type]);

  const runAction = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const target = toDelete;
    setToDelete(null);
    await runAction(() => announcementService.remove(target.uuid));
  };

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Announcements"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Announcements', active: true },
        ]}
        actionComponent={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
              onClick={() => navigate(paths.announcementNew)}
            >
              New announcement
            </Button>
          ) : undefined
        }
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SearchField
              value={search}
              placeholder="Search title or message"
              onChange={setSearch}
            />
            <FilterSelect
              label="Status"
              value={status}
              options={Object.entries(announcementStatusLabels).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={setStatus}
            />
            <FilterSelect
              label="Type"
              value={type}
              options={Object.entries(announcementTypeLabels).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={setType}
            />
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <TableContainer>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Audience</TableCell>
                  <TableCell>Visible from</TableCell>
                  <TableCell>Visible until</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
                {rows.map((row) => (
                  <TableRow
                    key={row.uuid}
                    hover
                    onClick={() => navigate(`${paths.announcements}/${row.uuid}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="subtitle2" noWrap>
                        {row.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: 'text.secondary', display: 'block' }}
                      >
                        {row.body}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <AnnouncementTypeChip type={row.type} />
                    </TableCell>
                    <TableCell>
                      <AnnouncementStatusChip status={row.status} />
                    </TableCell>
                    <TableCell>{announcementTargetLabels[row.targetType]}</TableCell>
                    <TableCell>{formatDateTime(row.startsAt)}</TableCell>
                    <TableCell>{row.endsAt ? formatDateTime(row.endsAt) : 'No end'}</TableCell>
                    <RowActionsCell
                      actions={[
                        {
                          label: canManage ? 'Edit' : 'View',
                          onClick: () => navigate(`${paths.announcements}/${row.uuid}`),
                        },
                        {
                          label: 'Publish',
                          visible: canManage && row.status === ANNOUNCEMENT_STATUS.DRAFT,
                          disabled: busy,
                          onClick: () =>
                            void runAction(() => announcementService.publish(row.uuid)),
                        },
                        {
                          label: 'Unpublish',
                          visible: canManage && row.status !== ANNOUNCEMENT_STATUS.DRAFT,
                          disabled: busy,
                          onClick: () =>
                            void runAction(() => announcementService.unpublish(row.uuid)),
                        },
                        {
                          label: 'Delete',
                          danger: true,
                          visible: canManage,
                          disabled: busy,
                          onClick: () => setToDelete(row),
                        },
                      ]}
                    />
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableEmptyRow colSpan={7} message="No announcements found." />
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePager
            page={meta.page}
            perPage={meta.perPage}
            total={meta.total}
            onChange={setPage}
          />
        </Stack>
      </Paper>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete announcement?"
        message={`"${toDelete?.title}" will be removed and schools will stop seeing it.`}
        confirmLabel="Delete"
        color="error"
        onConfirm={() => void handleDelete()}
        onClose={() => setToDelete(null)}
      />
    </Stack>
  );
};

export default AnnouncementList;
