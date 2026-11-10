import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { parseApiError } from 'lib/api';
import { formatDateTime } from 'lib/format';
import { formatRupees } from 'lib/money';
import { billingService } from 'services/billingService';
import { Payment } from 'types/billing';
import CopyText from 'components/common/CopyText';
import { PaymentStatusChip } from './BillingChips';
import DetailField from './DetailField';

interface PaymentDetailDialogProps {
  uuid: string | null;
  onClose: () => void;
}

// One payment with every Razorpay id and the raw object Razorpay sent.
const PaymentDetailDialog = ({ uuid, onClose }: PaymentDetailDialogProps) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uuid) return undefined;
    let active = true;
    setPayment(null);
    setError('');

    billingService
      .getPayment(uuid)
      .then((result) => {
        if (active) setPayment(result);
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
      <DialogTitle>Payment</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        {payment && (
          <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
            <PaymentStatusChip status={payment.status} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="School">{payment.client?.name ?? '-'}</DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Amount">{formatRupees(payment.amountPaise)}</DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Method">{payment.method ?? '-'}</DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Paid on">{formatDateTime(payment.paidAt)}</DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Razorpay fee">
                  {payment.feePaise === null ? '-' : formatRupees(payment.feePaise)}
                </DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Refunded">{formatRupees(payment.refundedPaise)}</DetailField>
              </Grid>
              {payment.failureReason && (
                <Grid size={12}>
                  <DetailField label="Why it failed">
                    {payment.failureReason}
                    {payment.failureCode ? ` (${payment.failureCode})` : ''}
                  </DetailField>
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Razorpay payment id">
                  <CopyText value={payment.razorpayPaymentId} />
                </DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Razorpay order id">
                  <CopyText value={payment.razorpayOrderId} />
                </DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Razorpay invoice id">
                  <CopyText value={payment.razorpayInvoiceId} />
                </DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Razorpay refund id">
                  <CopyText value={payment.razorpayRefundId} />
                </DetailField>
              </Grid>
            </Grid>

            {payment.gatewayData && (
              <DetailField label="As sent by Razorpay">
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    maxHeight: 280,
                    overflow: 'auto',
                    borderRadius: 2,
                    bgcolor: 'background.elevation1',
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(payment.gatewayData, null, 2)}
                </Box>
              </DetailField>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDetailDialog;
