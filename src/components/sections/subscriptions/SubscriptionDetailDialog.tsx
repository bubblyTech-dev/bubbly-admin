import { ReactNode, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { parseApiError } from 'lib/api';
import { formatDateTime } from 'lib/format';
import { formatRupees, intervalLabel } from 'lib/money';
import { subscriptionService } from 'services/subscriptionService';
import { Subscription } from 'types/subscriptions';
import CopyText from 'components/common/CopyText';
import SubscriptionStatusChip from './SubscriptionStatusChip';

interface SubscriptionDetailDialogProps {
  uuid: string | null;
  onClose: () => void;
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Box>{children}</Box>
  </Box>
);

// Everything stored about one subscription, including every Razorpay id.
const SubscriptionDetailDialog = ({ uuid, onClose }: SubscriptionDetailDialogProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uuid) return undefined;
    let active = true;
    setSubscription(null);
    setError('');

    subscriptionService
      .get(uuid)
      .then((result) => {
        if (active) setSubscription(result);
      })
      .catch((err) => {
        if (active) setError(parseApiError(err).message);
      });

    return () => {
      active = false;
    };
  }, [uuid]);

  return (
    <Dialog open={Boolean(uuid)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Subscription</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        {subscription && (
          <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <SubscriptionStatusChip status={subscription.status} />
              {subscription.cancelAtCycleEnd && (
                <Typography variant="body2" sx={{ color: 'warning.main' }}>
                  Ends after the current period
                </Typography>
              )}
            </Stack>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="School">{subscription.client?.name ?? '-'}</Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Plan">
                  {subscription.plan
                    ? `${subscription.plan.name} (v${subscription.plan.version})`
                    : '-'}
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Price">
                  {formatRupees(subscription.amountPaise)} /{' '}
                  {intervalLabel(subscription.billingInterval)}
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Charges">
                  {subscription.paidCount} paid
                  {subscription.remainingCount !== null
                    ? `, ${subscription.remainingCount} left`
                    : ''}
                  {subscription.totalCount !== null ? ` of ${subscription.totalCount}` : ''}
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Started">{formatDateTime(subscription.startedAt)}</Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Next charge">{formatDateTime(subscription.nextChargeAt)}</Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Current period">
                  {formatDateTime(subscription.currentPeriodStart)} to{' '}
                  {formatDateTime(subscription.currentPeriodEnd)}
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Cancel requested">
                  {formatDateTime(subscription.cancelRequestedAt)}
                </Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Cancelled">{formatDateTime(subscription.cancelledAt)}</Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Ended">{formatDateTime(subscription.endedAt)}</Field>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label="Created">{formatDateTime(subscription.createdAt)}</Field>
              </Grid>
            </Grid>

            <Stack direction="column" spacing={2}>
              <Typography variant="h6">Razorpay</Typography>
              <Field label="Subscription id">
                <CopyText value={subscription.razorpaySubscriptionId} />
              </Field>
              <Field label="Plan id">
                <CopyText value={subscription.razorpayPlanId} />
              </Field>
              <Field label="Customer id">
                <CopyText value={subscription.razorpayCustomerId} />
              </Field>
              <Field label="Payment link (share it with the school)">
                <CopyText value={subscription.shortUrl} />
              </Field>
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="soft" color="neutral" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionDetailDialog;
