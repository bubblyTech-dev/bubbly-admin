import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
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
  Tooltip,
  Typography,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { formatRupees, intervalLabel } from 'lib/money';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { planService } from 'services/planService';
import { PageMeta, Plan } from 'types/plans';
import IconifyIcon from 'components/base/IconifyIcon';
import ConfirmDialog from 'components/common/ConfirmDialog';
import PlanStatusChip from 'components/sections/plans/PlanStatusChip';
import PageHeader from 'components/sections/user-table/PageHeader';

type PendingAction = { type: 'publish' | 'archive' | 'delete'; plan: Plan } | null;

const confirmTexts = {
  publish: {
    title: 'Publish this plan?',
    message:
      'It will appear on the pricing page, and its price and billing interval can no longer be changed.',
    label: 'Publish',
  },
  archive: {
    title: 'Archive this plan?',
    message: 'It disappears from the pricing page. Schools already on it keep it.',
    label: 'Archive',
  },
  delete: {
    title: 'Delete this draft?',
    message: 'This removes the draft plan. It cannot be undone.',
    label: 'Delete',
  },
};

const PlanList = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, perPage: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<PendingAction>(null);
  const [working, setWorking] = useState(false);

  // wait a moment after typing before asking the server
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await planService.list({
        search: debouncedSearch || undefined,
        status: status ? Number(status) : undefined,
        page,
        perPage,
      });
      setPlans(result.plans);
      setMeta(result.meta);
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [debouncedSearch, status, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConfirm = async () => {
    if (!pending) return;
    setWorking(true);
    setError('');
    try {
      if (pending.type === 'publish') await planService.publish(pending.plan.uuid);
      if (pending.type === 'archive') await planService.archive(pending.plan.uuid);
      if (pending.type === 'delete') await planService.remove(pending.plan.uuid);
      setNotice(
        `Plan "${pending.plan.name}" ${pending.type === 'delete' ? 'deleted' : `${pending.type}d`}.`,
      );
      setPending(null);
      await load();
    } catch (err) {
      const info = parseApiError(err);
      setError(info.fields.plan ?? info.message);
      setPending(null);
    }
    setWorking(false);
  };

  const handleDuplicate = async (plan: Plan) => {
    setError('');
    try {
      const copy = await planService.duplicate(plan.uuid);
      navigate(`${paths.plans}/${copy.uuid}`);
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const canCreate = hasPermission('plans.create');
  const canEdit = hasPermission('plans.edit');
  const canPublish = hasPermission('plans.publish');
  const canArchive = hasPermission('plans.archive');

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Plans"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Plans', active: true },
        ]}
        actionComponent={
          canCreate ? (
            <Button
              variant="contained"
              component={RouterLink}
              to={paths.plansNew}
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            >
              New plan
            </Button>
          ) : undefined
        }
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {notice && (
            <Alert severity="success" onClose={() => setNotice('')}>
              {notice}
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search plans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { sm: 280 } }}
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
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="1">Draft</MenuItem>
              <MenuItem value="2">Published</MenuItem>
              <MenuItem value="3">Archived</MenuItem>
            </TextField>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Modules</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.uuid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Box>
                          <Typography
                            component={RouterLink}
                            to={`${paths.plans}/${plan.uuid}`}
                            variant="subtitle2"
                            sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 700 }}
                          >
                            {plan.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: 'text.secondary' }}
                          >
                            {plan.slug} · v{plan.version}
                          </Typography>
                        </Box>
                        {plan.isFeatured && (
                          <Tooltip title="Featured on the pricing page">
                            <IconifyIcon
                              icon="material-symbols:star-rounded"
                              sx={{ color: 'warning.main', fontSize: 18 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {formatRupees(plan.pricePaise)} / {intervalLabel(plan.billingInterval)}
                    </TableCell>
                    <TableCell>{plan.modules.length}</TableCell>
                    <TableCell>
                      <PlanStatusChip status={plan.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        {canEdit && plan.status !== 3 && (
                          <ActionIcon
                            label="Edit"
                            icon="material-symbols:edit-outline-rounded"
                            onClick={() => navigate(`${paths.plans}/${plan.uuid}`)}
                          />
                        )}
                        {canPublish && plan.status === 1 && (
                          <ActionIcon
                            label="Publish"
                            icon="material-symbols:check-circle-outline-rounded"
                            onClick={() => setPending({ type: 'publish', plan })}
                          />
                        )}
                        {canCreate && (
                          <ActionIcon
                            label="Duplicate"
                            icon="material-symbols:content-copy-outline-rounded"
                            onClick={() => void handleDuplicate(plan)}
                          />
                        )}
                        {canArchive && plan.status !== 3 && (
                          <ActionIcon
                            label="Archive"
                            icon="material-symbols:archive-outline-rounded"
                            onClick={() => setPending({ type: 'archive', plan })}
                          />
                        )}
                        {canArchive && plan.status === 1 && (
                          <ActionIcon
                            label="Delete"
                            icon="material-symbols:delete-outline-rounded"
                            onClick={() => setPending({ type: 'delete', plan })}
                          />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && plans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No plans found.
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
            rowsPerPage={meta.perPage}
            rowsPerPageOptions={[15, 30, 50]}
            onPageChange={(_event, value) => setPage(value + 1)}
            onRowsPerPageChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          />
        </Stack>
      </Paper>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending ? confirmTexts[pending.type].title : ''}
        message={pending ? confirmTexts[pending.type].message : ''}
        confirmLabel={pending ? confirmTexts[pending.type].label : 'Confirm'}
        color={pending?.type === 'delete' ? 'error' : 'primary'}
        loading={working}
        onConfirm={() => void handleConfirm()}
        onClose={() => setPending(null)}
      />
    </Stack>
  );
};

interface ActionIconProps {
  label: string;
  icon: string;
  onClick: () => void;
}

const ActionIcon = ({ label, icon, onClick }: ActionIconProps) => (
  <Tooltip title={label}>
    <IconButton size="small" aria-label={label} onClick={onClick}>
      <IconifyIcon icon={icon} sx={{ fontSize: 20 }} />
    </IconButton>
  </Tooltip>
);

export default PlanList;
