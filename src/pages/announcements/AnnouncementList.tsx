import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
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
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<Announcement | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await announcementService.list({
        search: search || undefined,
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
  }, [search, status, type, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  // search runs a moment after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

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
    <Paper sx={{ p: { xs: 3, md: 5 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 4 }}
      >
        <Typography variant="h4">Announcements</Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            onClick={() => navigate(paths.announcementNew)}
          >
            New announcement
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search title or message"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
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
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(announcementStatusLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(announcementTypeLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Audience</TableCell>
              <TableCell>Visible from</TableCell>
              <TableCell>Visible until</TableCell>
              {canManage && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.uuid} hover>
                <TableCell sx={{ maxWidth: 320 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/announcements/${row.uuid}`)}
                  >
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
                {canManage && (
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => navigate(`/announcements/${row.uuid}`)}
                    >
                      <IconifyIcon icon="material-symbols:edit-outline-rounded" />
                    </IconButton>
                    {row.status === ANNOUNCEMENT_STATUS.DRAFT ? (
                      <IconButton
                        size="small"
                        title="Publish"
                        aria-label="Publish"
                        disabled={busy}
                        onClick={() => runAction(() => announcementService.publish(row.uuid))}
                      >
                        <IconifyIcon icon="material-symbols:send-outline-rounded" />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        title="Unpublish"
                        aria-label="Unpublish"
                        disabled={busy}
                        onClick={() => runAction(() => announcementService.unpublish(row.uuid))}
                      >
                        <IconifyIcon icon="material-symbols:visibility-off" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      title="Delete"
                      aria-label="Delete"
                      disabled={busy}
                      onClick={() => setToDelete(row)}
                    >
                      <IconifyIcon icon="material-symbols:delete-outline-rounded" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6}>
                  <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                    No announcements found.
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={meta.total}
        page={meta.page - 1}
        rowsPerPage={perPage}
        rowsPerPageOptions={[15, 30, 50]}
        onPageChange={(_event, value) => setPage(value + 1)}
        onRowsPerPageChange={(e) => {
          setPerPage(Number(e.target.value));
          setPage(1);
        }}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>Delete announcement?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &quot;{toDelete?.title}&quot; will be removed and schools will stop seeing it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="soft" color="neutral" onClick={() => setToDelete(null)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AnnouncementList;
