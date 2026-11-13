import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  Alert,
  Box,
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
import { formatDate } from 'lib/format';
import { formatRupees, intervalLabel } from 'lib/money';
import { useAuth } from 'providers/AuthProvider';
import paths, { schoolPath } from 'routes/paths';
import { subscriptionService } from 'services/subscriptionService';
import { PageMeta } from 'types/plans';
import { SUBSCRIPTION_STATUS, Subscription, subscriptionStatusLabel } from 'types/subscriptions';
import ConfirmDialog from 'components/common/ConfirmDialog';
import CopyText from 'components/common/CopyText';
import FilterSelect from 'components/common/FilterSelect';
import PageHeader from 'components/common/PageHeader';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import SourceChip from 'components/sections/billing/SourceChip';
import ChangeExpiryDialog from 'components/sections/subscriptions/ChangeExpiryDialog';
import SubscriptionDetailDialog from 'components/sections/subscriptions/SubscriptionDetailDialog';
import SubscriptionStatusChip from 'components/sections/subscriptions/SubscriptionStatusChip';
import useSubscriptionActions from 'components/sections/subscriptions/useSubscriptionActions';

const statusOptions = Object.entries(subscriptionStatusLabel).map(([value, label]) => ({
  value,
  label,
}));

const SubscriptionList = () => {
  const { hasPermission } = useAuth();

  const [rows, setRows] = useState<Subscription[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, perPage: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [viewing, setViewing] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [changingExpiry, setChangingExpiry] = useState<Subscription | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  // a new search or filter starts again from the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await subscriptionService.list({
        search: debouncedSearch || undefined,
        status: status ? Number(status) : undefined,
        page,
        perPage: 15,
      });
      setRows(result.subscriptions);
      setMeta(result.meta);
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [debouncedSearch, status, page, refreshKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const actions = useSubscriptionActions((message) => {
    setNotice(message);
    setRefreshKey((key) => key + 1);
  });

  const canManage = hasPermission('subscriptions.manage');
  const isEnded = (row: Subscription) =>
    [SUBSCRIPTION_STATUS.CANCELLED, SUBSCRIPTION_STATUS.EXPIRED].includes(row.status as 4 | 5);
  const canCancel = (row: Subscription) =>
    canManage &&
    ![SUBSCRIPTION_STATUS.CANCELLED, SUBSCRIPTION_STATUS.EXPIRED].includes(row.status as 4 | 5) &&
    !row.cancelAtCycleEnd;

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Subscriptions"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Subscriptions', active: true },
        ]}
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={3}>
          {(error || actions.error) && <Alert severity="error">{error || actions.error}</Alert>}
          {notice && (
            <Alert severity="success" onClose={() => setNotice('')}>
              {notice}
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SearchField
              value={search}
              placeholder="Search school or Razorpay id"
              onChange={setSearch}
            />
            <FilterSelect
              label="Status"
              value={status}
              options={statusOptions}
              onChange={setStatus}
            />
          </Stack>

          <TableContainer>
            <Table sx={{ minWidth: 880 }}>
              <TableHead>
                <TableRow>
                  <TableCell>School</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Next charge / valid until</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Razorpay id</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
                {rows.map((row) => (
                  <TableRow
                    key={row.uuid}
                    hover
                    onClick={() => setViewing(row.uuid)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {row.client ? (
                        <Typography
                          variant="subtitle2"
                          component={RouterLink}
                          to={schoolPath(row.client.uuid)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {row.client.name}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{row.plan?.name ?? '-'}</TableCell>
                    <TableCell>
                      <Box>
                        <SubscriptionStatusChip status={row.status} />
                        {row.cancelAtCycleEnd && (
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: 'warning.main' }}
                          >
                            Ends after this period
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatRupees(row.amountPaise)} / {intervalLabel(row.billingInterval)}
                    </TableCell>
                    <TableCell>
                      {row.source === 2
                        ? formatDate(row.currentPeriodEnd)
                        : formatDate(row.nextChargeAt)}
                    </TableCell>
                    <TableCell>
                      <SourceChip source={row.source} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <CopyText value={row.razorpaySubscriptionId} />
                    </TableCell>
                    <RowActionsCell
                      actions={[
                        { label: 'View', onClick: () => setViewing(row.uuid) },
                        {
                          label: 'Change expiry date',
                          visible: canManage && row.source === 2 && !isEnded(row),
                          onClick: () => setChangingExpiry(row),
                        },
                        {
                          label: 'Sync with Razorpay',
                          visible: canManage && row.source !== 2,
                          onClick: () => void actions.sync(row),
                        },
                        {
                          label: 'Cancel at period end',
                          danger: true,
                          visible: canCancel(row),
                          onClick: () => actions.askCancel(row),
                        },
                      ]}
                    />
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableEmptyRow colSpan={8} message="No subscriptions found." />
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

      <SubscriptionDetailDialog uuid={viewing} onClose={() => setViewing(null)} />

      <ChangeExpiryDialog
        subscription={changingExpiry}
        onClose={() => setChangingExpiry(null)}
        onChanged={() => {
          setNotice('Expiry date changed.');
          setRefreshKey((key) => key + 1);
        }}
      />

      <ConfirmDialog
        open={Boolean(actions.cancelling)}
        title="Cancel this subscription?"
        message={`${actions.cancelling?.client?.name ?? 'The school'} keeps access until the end of the period it has paid for, and is not charged again. A subscription that has not started yet is cancelled immediately.`}
        confirmLabel="Cancel at period end"
        color="error"
        loading={actions.working}
        error={actions.cancelError}
        onConfirm={() => void actions.confirmCancel()}
        onClose={actions.closeCancel}
      />
    </Stack>
  );
};

export default SubscriptionList;
