import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { parseApiError } from 'lib/api';
import { subscriptionService } from 'services/subscriptionService';
import { Subscription } from 'types/subscriptions';

interface ChangeExpiryDialogProps {
  subscription: Subscription | null;
  onClose: () => void;
  onChanged: () => void;
}

// Offline subscriptions only: staff decide the last day the school may use the product.
const ChangeExpiryDialog = ({ subscription, onClose, onChanged }: ChangeExpiryDialogProps) => {
  const [validUntil, setValidUntil] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    if (!subscription) return;
    setValidUntil(
      subscription.currentPeriodEnd
        ? dayjs(subscription.currentPeriodEnd).format('YYYY-MM-DD')
        : '',
    );
    setError('');
    setFieldError('');
  }, [subscription]);

  const handleSave = async () => {
    if (!subscription) return;
    setSaving(true);
    setError('');
    setFieldError('');
    try {
      await subscriptionService.changeExpiry(subscription.uuid, validUntil);
      onChanged();
      onClose();
    } catch (err) {
      const info = parseApiError(err);
      setError(info.fields.subscription ?? info.message);
      setFieldError(info.fields.validUntil ?? '');
    }
    setSaving(false);
  };

  return (
    <Dialog
      open={Boolean(subscription)}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Change expiry date</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subscription?.client?.name ?? 'The school'} can use Bubbly until the end of this day. A
            later date gives a late or suspended school its access back.
          </Typography>
          <TextField
            fullWidth
            type="date"
            label="Valid until"
            value={validUntil}
            disabled={saving}
            onChange={(e) => setValidUntil(e.target.value)}
            error={Boolean(fieldError)}
            helperText={fieldError}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="soft" color="neutral" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving || !validUntil}
        >
          {saving ? 'Saving…' : 'Save date'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeExpiryDialog;
