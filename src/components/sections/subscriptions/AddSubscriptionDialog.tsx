import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { formatRupees, intervalLabel } from 'lib/money';
import { planService } from 'services/planService';
import { subscriptionService } from 'services/subscriptionService';
import { Plan } from 'types/plans';
import { Subscription } from 'types/subscriptions';

interface AddSubscriptionDialogProps {
  open: boolean;
  schoolUuid: string;
  schoolName: string;
  onClose: () => void;
  onCreated: (subscription: Subscription) => void;
}

// Pick a published plan that exists on Razorpay. The subscription starts as Pending and the school pays through the link.
const AddSubscriptionDialog = ({
  open,
  schoolUuid,
  schoolName,
  onClose,
  onCreated,
}: AddSubscriptionDialogProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planUuid, setPlanUuid] = useState('');
  const [startAt, setStartAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setPlanUuid('');
    setStartAt('');
    setError('');
    setFields({});
    setLoading(true);

    planService
      .list({ status: 2, perPage: 100 })
      .then((result) => {
        if (active) setPlans(result.plans.filter((plan) => plan.gatewaySynced));
      })
      .catch((err) => {
        if (active) setError(parseApiError(err).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setFields({});
    try {
      const created = await subscriptionService.createForSchool(schoolUuid, {
        planUuid,
        startAt: startAt ? new Date(startAt).toISOString() : undefined,
      });
      onCreated(created);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add subscription for {schoolName}</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{fields.client ?? error}</Alert>}
          {!loading && plans.length === 0 && (
            <Alert severity="info">
              There is no published plan on Razorpay yet. Publish a plan, or use Sync to Razorpay on
              a published plan, then come back.
            </Alert>
          )}
          <TextField
            select
            fullWidth
            label="Plan"
            value={planUuid}
            disabled={loading || saving}
            onChange={(e) => setPlanUuid(e.target.value)}
            error={Boolean(fields.planUuid)}
            helperText={fields.planUuid}
          >
            {plans.map((plan) => (
              <MenuItem key={plan.uuid} value={plan.uuid}>
                {plan.name} · {formatRupees(plan.pricePaise)} /{' '}
                {intervalLabel(plan.billingInterval)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="datetime-local"
            label="First charge (optional)"
            value={startAt}
            disabled={saving}
            onChange={(e) => setStartAt(e.target.value)}
            error={Boolean(fields.startAt)}
            helperText={
              fields.startAt ?? 'Leave empty to start when the school authorises the payment.'
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            The subscription is created as Pending. It becomes Active only after Razorpay confirms
            the first payment.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="soft" color="neutral" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving || loading || !planUuid}
        >
          {saving ? 'Creating…' : 'Create subscription'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSubscriptionDialog;
