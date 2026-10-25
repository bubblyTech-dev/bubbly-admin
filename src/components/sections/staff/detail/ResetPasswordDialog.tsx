import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { staffService } from 'services/staffService';
import { StaffUser } from 'types/staff';
import PasswordTextField from 'components/common/PasswordTextField';

interface ResetPasswordDialogProps {
  open: boolean;
  staff: StaffUser;
  onClose: () => void;
  onDone: () => void;
}

// Sets a new password for a staff member. They are signed out everywhere and must change it at the next login.
const ResetPasswordDialog = ({ open, staff, onClose, onDone }: ResetPasswordDialogProps) => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setConfirmation('');
    setError('');
    setFields({});
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFields({});
    setSaving(true);
    try {
      await staffService.resetPassword(staff.uuid, password, confirmation);
      onDone();
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <form noValidate onSubmit={handleSubmit}>
        <DialogTitle>Set a new password</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
            <DialogContentText>
              {staff.name || staff.email} will be signed out everywhere and must change this
              password at the next login.
            </DialogContentText>
            {error && <Alert severity="error">{error}</Alert>}
            <PasswordTextField
              fullWidth
              label="New password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(fields.password)}
              helperText={fields.password}
            />
            <PasswordTextField
              fullWidth
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              error={Boolean(fields.passwordConfirmation)}
              helperText={fields.passwordConfirmation}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="soft" color="neutral" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Set password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ResetPasswordDialog;
