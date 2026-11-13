import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { parseApiError } from 'lib/api';
import { formatRupees, intervalLabel } from 'lib/money';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { planService } from 'services/planService';
import { PageMeta, Plan } from 'types/plans';
import IconifyIcon from 'components/base/IconifyIcon';
import ConfirmDialog from 'components/common/ConfirmDialog';
import FilterSelect from 'components/common/FilterSelect';
import PageHeader from 'components/common/PageHeader';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import GatewayChip from 'components/sections/plans/GatewayChip';
import PlanStatusChip from 'components/sections/plans/PlanStatusChip';

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
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<PendingAction>(null);
  const [working, setWorking] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  // a new search or filter starts again from the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

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

  const handleSync = async (plan: Plan) => {
    setError('');
    try {
      await planService.syncGateway(plan.uuid);
      setNotice(`Plan "${plan.name}" is now on Razorpay.`);
      await load();
    } catch (err) {
      const info = parseApiError(err);
      setError(info.fields.plan ?? info.message);
    }
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
            <SearchField value={search} placeholder="Search plans" onChange={setSearch} />
            <FilterSelect
              label="Status"
              value={status}
              options={[
                { value: '1', label: 'Draft' },
                { value: '2', label: 'Published' },
                { value: '3', label: 'Archived' },
              ]}
              onChange={setStatus}
            />
          </Stack>

          <TableContainer>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Features</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Razorpay</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
                {plans.map((plan) => (
                  <TableRow
                    key={plan.uuid}
                    hover
                    onClick={() => navigate(`${paths.plans}/${plan.uuid}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2">{plan.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                    <TableCell>
                      {plan.features.length === 1
                        ? '1 feature'
                        : `${plan.features.length} features`}
                    </TableCell>
                    <TableCell>
                      <PlanStatusChip status={plan.status} />
                    </TableCell>
                    <TableCell>
                      <GatewayChip plan={plan} />
                    </TableCell>
                    <RowActionsCell
                      actions={[
                        {
                          label: plan.status === 3 ? 'View' : 'Edit',
                          visible: plan.status === 3 || canEdit,
                          onClick: () => navigate(`${paths.plans}/${plan.uuid}`),
                        },
                        {
                          label: 'Publish',
                          visible: canPublish && plan.status === 1,
                          onClick: () => setPending({ type: 'publish', plan }),
                        },
                        {
                          label: 'Sync to Razorpay',
                          visible: canPublish && plan.status === 2 && !plan.gatewaySynced,
                          onClick: () => void handleSync(plan),
                        },
                        {
                          label: 'Duplicate',
                          visible: canCreate,
                          onClick: () => void handleDuplicate(plan),
                        },
                        {
                          label: 'Archive',
                          visible: canArchive && plan.status !== 3,
                          onClick: () => setPending({ type: 'archive', plan }),
                        },
                        {
                          label: 'Delete',
                          danger: true,
                          visible: canArchive && plan.status === 1,
                          onClick: () => setPending({ type: 'delete', plan }),
                        },
                      ]}
                    />
                  </TableRow>
                ))}
                {!loading && plans.length === 0 && (
                  <TableEmptyRow colSpan={6} message="No plans found." />
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

export default PlanList;
