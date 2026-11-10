import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
import { formatDateTime } from 'lib/format';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { billingService } from 'services/billingService';
import { WEBHOOK_STATUS, WebhookEvent, webhookStatusLabel } from 'types/billing';
import { PageMeta } from 'types/plans';
import ConfirmDialog from 'components/common/ConfirmDialog';
import CopyText from 'components/common/CopyText';
import FilterSelect from 'components/common/FilterSelect';
import PageHeader from 'components/common/PageHeader';
import RowActionsCell from 'components/common/RowActionsCell';
import SearchField from 'components/common/SearchField';
import TableEmptyRow from 'components/common/TableEmptyRow';
import TablePager from 'components/common/TablePager';
import { WebhookStatusChip } from 'components/sections/billing/BillingChips';
import WebhookEventDialog from 'components/sections/billing/WebhookEventDialog';

const statusOptions = Object.entries(webhookStatusLabel).map(([value, label]) => ({
  value,
  label,
}));

const WebhookEventList = () => {
  const { hasPermission } = useAuth();

  const [rows, setRows] = useState<WebhookEvent[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, perPage: 15, total: 0, lastPage: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [viewing, setViewing] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState<WebhookEvent | null>(null);
  const [working, setWorking] = useState(false);
  const [reprocessError, setReprocessError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebouncedValue(search);

  // a new search or filter starts again from the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await billingService.listEvents({
        search: debouncedSearch || undefined,
        status: status ? Number(status) : undefined,
        page,
        perPage: 15,
      });
      setRows(result.items);
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

  const canReprocess = (row: WebhookEvent) =>
    hasPermission('subscriptions.manage') && row.status === WEBHOOK_STATUS.FAILED;

  const confirmReprocess = async () => {
    if (!reprocessing) return;
    setWorking(true);
    setReprocessError('');
    try {
      const result = await billingService.reprocessEvent(reprocessing.uuid);
      setReprocessing(null);
      setNotice(result.message);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setReprocessError(parseApiError(err).message);
    }
    setWorking(false);
  };

  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Webhook events"
        breadcrumb={[
          { label: 'Home', url: paths.root },
          { label: 'Billing' },
          { label: 'Webhook events', active: true },
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

          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 720 }}>
            Every call Razorpay makes to the payment webhook. A failed event is tried again by
            Razorpay on its own; once the cause is fixed you can also process it again here.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SearchField value={search} placeholder="Search event id" onChange={setSearch} />
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
                  <TableCell>Event</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Attempts</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell>Event id</TableCell>
                  <TableCell>Error</TableCell>
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
                      <Typography variant="subtitle2">{row.eventType}</Typography>
                    </TableCell>
                    <TableCell>
                      <WebhookStatusChip status={row.status} />
                    </TableCell>
                    <TableCell>{row.attempts}</TableCell>
                    <TableCell>{formatDateTime(row.receivedAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <CopyText value={row.eventId} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 260, color: 'error.main' }}>
                      <Typography variant="body2" noWrap title={row.errorMessage ?? undefined}>
                        {row.errorMessage ?? ''}
                      </Typography>
                    </TableCell>
                    <RowActionsCell
                      actions={[
                        { label: 'View', onClick: () => setViewing(row.uuid) },
                        {
                          label: 'Process again',
                          visible: canReprocess(row),
                          onClick: () => {
                            setReprocessError('');
                            setReprocessing(row);
                          },
                        },
                      ]}
                    />
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableEmptyRow colSpan={7} message="No webhook events found." />
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

      <WebhookEventDialog uuid={viewing} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={Boolean(reprocessing)}
        title="Process this event again?"
        message={`The ${reprocessing?.eventType ?? ''} event is run again exactly as Razorpay sent it. This is safe to do more than once.`}
        confirmLabel="Process again"
        loading={working}
        error={reprocessError}
        onConfirm={() => void confirmReprocess()}
        onClose={() => setReprocessing(null)}
      />
    </Stack>
  );
};

export default WebhookEventList;
