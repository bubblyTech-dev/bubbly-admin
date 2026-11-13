import { ReactNode, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { parseApiError } from 'lib/api';

export const MIN_REASON = 3;

interface EntitlementDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  // extra inputs shown above the reason (the limit value)
  children?: ReactNode;
  // return false to keep the dialog open (caller's own validation failed)
  onSubmit: (reason: string) => Promise<boolean | void>;
  onClose: () => void;
}

// Asks for the required reason before an override is saved. Server errors (422) appear under the fields.
const EntitlementDialog = ({
  open,
  title,
  description,
  confirmLabel,
  children,
  onSubmit,
  onClose,
}: EntitlementDialogProps) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setReason('');
    setError('');
    setFields({});
  }, [open]);

  const handleConfirm = async () => {
    setError('');
    setFields({});
    if (reason.trim().length < MIN_REASON) {
      setFields({ reason: `Enter a reason of at least ${MIN_REASON} characters.` });
      return;
    }
    setSaving(true);
    try {
      const result = await onSubmit(reason.trim());
      if (result !== false) onClose();
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {children}
          <TextField
            fullWidth
            multiline
            minRows={3}
            id="entitlement-reason"
            label="Reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={Boolean(fields.reason)}
            helperText={fields.reason ?? 'Saved with the change so other admins can see why.'}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="soft" color="neutral" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void handleConfirm()} disabled={saving}>
          {saving ? 'Saving…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntitlementDialog;
