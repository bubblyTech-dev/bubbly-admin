import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import useDebouncedValue from 'hooks/useDebouncedValue';
import { parseApiError } from 'lib/api';
import { formatDate } from 'lib/format';
import { formatRupees } from 'lib/money';
import { useAuth } from 'providers/AuthProvider';
import paths, { schoolPath } from 'routes/paths';
import { renewalService } from 'services/renewalService';
import { subscriptionService } from 'services/subscriptionService';
import {
  RENEWAL_SOURCE,
  RenewalCounts,
  RenewalListMeta,
  RenewalRow,
  RenewalTab,
  renewalTabs,
} from 'types/renewals';
import PageHeader from 'components/common/PageHeader';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import RenewalDaysChip from 'components/sections/renewals/RenewalDaysChip';
import SubscriptionDetailDialog from 'components/sections/subscriptions/SubscriptionDetailDialog';
import SubscriptionStatusChip from 'components/sections/subscriptions/SubscriptionStatusChip';

const emptyMessages: Record<RenewalTab, string> = {
  due_soon: 'No renewals are due soon.',
  payment_failed: 'No failed payments.',
  in_grace: 'No schools are in their grace period.',
  suspended: 'No suspended schools.',
};

const emptyMeta: RenewalListMeta = {
  page: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
  tab: 'due_soon',
  dueSoonDays: 7,
  graceDays: 7,
};

// Which schools need attention: payments due soon, failed, in their grace period or suspended.
// The number of days for "due soon" and the grace period come from Settings.
const RenewalList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [tab, setTab] = useState<RenewalTab>('due_soon');
  const [counts, setCounts] = useState<RenewalCounts | null>(null);
  const [rows, setRows] = useState<RenewalRow[]>([]);
  const [meta, setMeta] = useState<RenewalListMeta>(emptyMeta);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [viewing, setViewing] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebouncedValue(search);

  // a new tab or search starts again from the first page
  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, summary] = await Promise.all([
        renewalService.list({ tab, search: debouncedSearch || undefined, page, perPage: 15 }),
        renewalService.counts(),
      ]);
      setRows(list.rows);
      setMeta(list.meta);
      setCounts(summary);
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [tab, debouncedSearch, page, refreshKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const sync = async (row: RenewalRow) => {
    setError('');
    try {
      await subscriptionService.sync(row.uuid);
      setNotice('Refreshed from Razorpay.');
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const canManage = hasPermission('subscriptions.manage');
  const canViewSubscription = hasPermission('subscriptions.view');

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Renewals"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Renewals', active: true },
        ]}
      />

      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Stack direction="column" spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {notice && (
            <Alert severity="success" onClose={() => setNotice('')}>
              {notice}
            </Alert>
          )}

          {counts && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 6 }}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.elevation1',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Due in the next {counts.summary.dueSoonDays} days
                </Typography>
                <Typography variant="h4">
                  {formatRupees(counts.summary.dueSoonAmountPaise)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Needs attention
                </Typography>
                <Typography variant="h4">
                  {counts.counts.payment_failed + counts.counts.suspended}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  failed or suspended
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Grace period
                </Typography>
                <Typography variant="h4">{counts.summary.graceDays} days</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  set in Settings
                </Typography>
              </Box>
            </Stack>
          )}

          <Tabs
            value={tab}
            onChange={(_event: SyntheticEvent, value: RenewalTab) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {renewalTabs.map((item) => (
              <Tab
                key={item.value}
                value={item.value}
                label={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>{item.label}</span>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        minWidth: 24,
                        borderRadius: 999,
                        fontSize: 12,
                        lineHeight: '20px',
                        textAlign: 'center',
                        bgcolor: 'rgba(127, 127, 127, 0.25)',
                      }}
                    >
                      {counts ? counts.counts[item.value] : '-'}
                    </Box>
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SearchField
              value={search}
              placeholder="Search school, plan or Razorpay id"
              onChange={setSearch}
            />
          </Stack>

          <TableContainer>
            <Table sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>School</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>
                    {rows[0]?.dateLabel ?? renewalTabs.find((t) => t.value === tab)?.label}
                  </TableCell>
                  <TableCell>When</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
                {rows.map((row) => (
                  <TableRow
                    key={row.uuid}
                    hover
                    onClick={() => canViewSubscription && setViewing(row.uuid)}
                    sx={{ cursor: canViewSubscription ? 'pointer' : 'default' }}
                  >
                    <TableCell>
                      {row.school ? (
                        <Typography
                          variant="subtitle2"
                          component={RouterLink}
                          to={schoolPath(row.school.uuid)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {row.school.name}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <span>{row.plan?.name ?? '-'}</span>
                        {row.source === RENEWAL_SOURCE.OFFLINE && (
                          <Chip size="small" variant="outlined" label="Offline" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{formatRupees(row.amountPaise)}</TableCell>
                    <TableCell>
                      {formatDate(row.date)}
                      {row.cancelAtCycleEnd && (
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', color: 'warning.main' }}
                        >
                          Ends after this period
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <RenewalDaysChip tab={tab} daysLeft={row.daysLeft} />
                    </TableCell>
                    <TableCell>
                      <SubscriptionStatusChip status={row.status} />
                    </TableCell>
                    <RowActionsCell
                      actions={[
                        {
                          label: 'View subscription',
                          visible: canViewSubscription,
                          onClick: () => setViewing(row.uuid),
                        },
                        {
                          label: 'Open school',
                          visible: Boolean(row.school),
                          onClick: () => row.school && navigate(schoolPath(row.school.uuid)),
                        },
                        {
                          label: 'Sync with Razorpay',
                          visible: canManage && row.source === RENEWAL_SOURCE.RAZORPAY,
                          onClick: () => void sync(row),
                        },
                      ]}
                    />
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableEmptyRow colSpan={7} message={emptyMessages[tab]} />
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
    </Stack>
  );
};

export default RenewalList;
