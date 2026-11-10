import { useCallback, useEffect, useState } from 'react';
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
import { parseApiError } from 'lib/api';
import { formatDate } from 'lib/format';
import { formatRupees, intervalLabel } from 'lib/money';
import { useAuth } from 'providers/AuthProvider';
import { subscriptionService } from 'services/subscriptionService';
import { SUBSCRIPTION_STATUS, Subscription } from 'types/subscriptions';
import IconifyIcon from 'components/base/IconifyIcon';
import ConfirmDialog from 'components/common/ConfirmDialog';
import CopyText from 'components/common/CopyText';
import RowActionsCell from 'components/common/RowActionsCell';
import TableEmptyRow from 'components/common/TableEmptyRow';
import AddSubscriptionDialog from './AddSubscriptionDialog';
import SubscriptionDetailDialog from './SubscriptionDetailDialog';
import SubscriptionStatusChip from './SubscriptionStatusChip';
import useSubscriptionActions from './useSubscriptionActions';

interface SchoolSubscriptionsProps {
  schoolUuid: string;
  schoolName: string;
}

// The "Subscription" tab of a school: its subscriptions, with the payment link and an "Add subscription" action.
const SchoolSubscriptions = ({ schoolUuid, schoolName }: SchoolSubscriptionsProps) => {
  const { hasPermission } = useAuth();

  const [rows, setRows] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await subscriptionService.forSchool(schoolUuid));
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [schoolUuid, refreshKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const actions = useSubscriptionActions((message) => {
    setNotice(message);
    setRefreshKey((key) => key + 1);
  });

  const canManage = hasPermission('subscriptions.manage');
  const isFinished = (row: Subscription) =>
    [SUBSCRIPTION_STATUS.CANCELLED, SUBSCRIPTION_STATUS.EXPIRED].includes(row.status as 4 | 5);
  const hasOpen = rows.some((row) => !isFinished(row));

  return (
    <Stack direction="column" spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 560 }}>
          A school can have one subscription at a time. Share the payment link with the school; the
          subscription becomes Active after Razorpay confirms the first payment.
        </Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            disabled={hasOpen}
            onClick={() => setAdding(true)}
          >
            Add subscription
          </Button>
        )}
      </Stack>

      {(error || actions.error) && <Alert severity="error">{error || actions.error}</Alert>}
      {notice && (
        <Alert severity="success" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <Paper variant="outlined">
        <TableContainer>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Next charge</TableCell>
                <TableCell>Payment link</TableCell>
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
                  <TableCell>{row.plan?.name ?? '-'}</TableCell>
                  <TableCell>
                    <SubscriptionStatusChip status={row.status} />
                  </TableCell>
                  <TableCell>
                    {formatRupees(row.amountPaise)} / {intervalLabel(row.billingInterval)}
                  </TableCell>
                  <TableCell>{formatDate(row.nextChargeAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {row.status === SUBSCRIPTION_STATUS.PENDING ? (
                      <CopyText value={row.shortUrl} label="Copy link" />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <RowActionsCell
                    actions={[
                      { label: 'View', onClick: () => setViewing(row.uuid) },
                      {
                        label: 'Sync with Razorpay',
                        visible: canManage,
                        onClick: () => void actions.sync(row),
                      },
                      {
                        label: 'Cancel at period end',
                        danger: true,
                        visible: canManage && !isFinished(row) && !row.cancelAtCycleEnd,
                        onClick: () => actions.askCancel(row),
                      },
                    ]}
                  />
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableEmptyRow colSpan={6} message="This school has no subscription yet." />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <AddSubscriptionDialog
        open={adding}
        schoolUuid={schoolUuid}
        schoolName={schoolName}
        onClose={() => setAdding(false)}
        onCreated={() => {
          setAdding(false);
          setNotice('Subscription created. Copy the payment link and share it with the school.');
          setRefreshKey((key) => key + 1);
        }}
      />

      <SubscriptionDetailDialog uuid={viewing} onClose={() => setViewing(null)} />

      <ConfirmDialog
        open={Boolean(actions.cancelling)}
        title="Cancel this subscription?"
        message="The school keeps access until the end of the period it has paid for, and is not charged again. A subscription that has not started yet is cancelled immediately."
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

export default SchoolSubscriptions;
