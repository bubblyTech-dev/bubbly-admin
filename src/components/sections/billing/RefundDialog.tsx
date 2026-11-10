import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { formatRupees, paiseToRupees, rupeesToPaise } from 'lib/money';
import { billingService } from 'services/billingService';
import { Payment } from 'types/billing';
import DetailField from './DetailField';

interface RefundDialogProps {
  // the payment to refund; the dialog is open while this is set
  payment: Payment | null;
  onClose: () => void;
  // called after the refund went through; `warning` explains a step that could not be done
  onRefunded: (payment: Payment, warning: string | null) => void;
}

// Refunding a payment in two steps: fill in the details, then confirm. The amount can be less than the balance
// (a partial refund). The subscription is only cancelled when the box is ticked, and then at the end of the period.
const RefundDialog = ({ payment, onClose, onRefunded }: RefundDialogProps) => {
  const [reasons, setReasons] = useState<string[]>([]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  // start fresh for every payment that is opened
  useEffect(() => {
    if (!payment) return undefined;
    let active = true;
    setAmount(paiseToRupees(payment.refundablePaise));
    setReason('');
    setNote('');
    setCancelSubscription(false);
    setConfirming(false);
    setError('');
    setFields({});

    billingService
      .refundReasons()
      .then((list) => {
        if (active) setReasons(list);
      })
      .catch((err) => {
        if (active) setError(parseApiError(err).message);
      });

    return () => {
      active = false;
    };
  }, [payment]);

  if (!payment) return null;

  const balance = payment.refundablePaise;
  const amountPaise = rupeesToPaise(amount);

  // the first step: check the form before showing the confirmation
  const review = () => {
    const problems: Record<string, string> = {};
    if (amountPaise === null || amountPaise < 1)
      problems.amountPaise = 'Enter an amount in rupees, for example 499 or 499.50.';
    else if (amountPaise > balance)
      problems.amountPaise = `The most you can refund is ${formatRupees(balance)}.`;
    if (!reason) problems.reason = 'Choose a reason for the refund.';
    setFields(problems);
    setError('');
    if (Object.keys(problems).length === 0) setConfirming(true);
  };

  const submit = async () => {
    if (amountPaise === null) return;
    setSaving(true);
    setError('');
    try {
      const result = await billingService.refundPayment(payment.uuid, {
        amountPaise,
        reason,
        note: note.trim() || undefined,
        cancelSubscription: payment.subscriptionUuid ? cancelSubscription : undefined,
      });
      onRefunded(result.payment, result.warning);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
      setConfirming(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{confirming ? 'Confirm the refund' : 'Refund payment'}</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {confirming ? (
            <Stack direction="column" spacing={2}>
              <Alert severity="warning">
                {payment.offline
                  ? 'This only records the refund. No money moves through Razorpay.'
                  : 'The money goes back to the customer through Razorpay. This cannot be undone.'}
              </Alert>
              <DetailField label="School">{payment.client?.name ?? '-'}</DetailField>
              <DetailField label="Refund amount">
                {amountPaise === null ? '-' : formatRupees(amountPaise)}
              </DetailField>
              <DetailField label="Reason">{reason}</DetailField>
              {note.trim() && <DetailField label="Note">{note.trim()}</DetailField>}
              <DetailField label="Subscription">
                {payment.subscriptionUuid && cancelSubscription
                  ? 'Will be cancelled at the end of the current period'
                  : 'Stays as it is'}
              </DetailField>
            </Stack>
          ) : (
            <>
              <Stack direction="row" spacing={4}>
                <DetailField label="Paid">{formatRupees(payment.amountPaise)}</DetailField>
                <DetailField label="Already refunded">
                  {formatRupees(payment.refundedPaise)}
                </DetailField>
                <DetailField label="Can still be refunded">{formatRupees(balance)}</DetailField>
              </Stack>

              {payment.offline && (
                <Alert severity="info">
                  This payment was recorded by staff, so the refund is only recorded here. No money
                  moves through Razorpay.
                </Alert>
              )}

              <TextField
                label="Amount to refund (Rs.)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={Boolean(fields.amountPaise)}
                helperText={
                  fields.amountPaise ??
                  'The full balance is filled in. Enter less for a partial refund.'
                }
                fullWidth
              />

              <TextField
                select
                label="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                error={Boolean(fields.reason)}
                helperText={fields.reason}
                fullWidth
              >
                {reasons.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                minRows={2}
                slotProps={{ htmlInput: { maxLength: 300 } }}
                fullWidth
              />

              {payment.subscriptionUuid && (
                <Stack direction="column" spacing={0.5}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cancelSubscription}
                        onChange={(e) => setCancelSubscription(e.target.checked)}
                      />
                    }
                    label="Also cancel the subscription at the end of the period"
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', pl: 4 }}>
                    The school keeps access until the current period ends.
                  </Typography>
                </Stack>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {confirming ? (
          <>
            <Button onClick={() => setConfirming(false)} disabled={saving}>
              Back
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => void submit()}
              disabled={saving}
            >
              {saving
                ? 'Refunding…'
                : `Refund ${amountPaise === null ? '' : formatRupees(amountPaise)}`}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={review}>
              Review refund
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RefundDialog;
