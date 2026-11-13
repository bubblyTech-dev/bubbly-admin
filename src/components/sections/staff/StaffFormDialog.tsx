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
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { staffService } from 'services/staffService';
import { StaffUser } from 'types/staff';
import PasswordTextField from 'components/common/PasswordTextField';

interface StaffFormDialogProps {
  open: boolean;
  // null = add a new staff member, otherwise edit this one
  staff: StaffUser | null;
  onClose: () => void;
  onSaved: (staff: StaffUser, created: boolean) => void;
}

const emptyForm = { name: '', email: '', phone: '', password: '', passwordConfirmation: '' };

// Add or edit a staff member. The first password must be changed by them at the first login.
const StaffFormDialog = ({ open, staff, onClose, onSaved }: StaffFormDialogProps) => {
  const editing = Boolean(staff);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  // start fresh every time the dialog opens
  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      name: staff?.name ?? '',
      email: staff?.email ?? '',
      phone: staff?.phone ?? '',
    });
    setError('');
    setFields({});
  }, [open, staff]);

  const change = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFields({});
    setSaving(true);
    try {
      const saved = staff
        ? await staffService.update(staff.uuid, {
            name: form.name,
            email: form.email,
            phone: form.phone,
          })
        : await staffService.create(form);
      onSaved(saved, !staff);
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
        <DialogTitle>{editing ? 'Edit staff member' : 'Add staff member'}</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={change('name')}
              error={Boolean(fields.name)}
              helperText={fields.name}
              autoFocus
            />
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={form.email}
              onChange={change('email')}
              error={Boolean(fields.email)}
              helperText={fields.email ?? (editing ? '' : 'They log in with this email.')}
            />
            <TextField
              fullWidth
              label="Phone (optional)"
              value={form.phone}
              onChange={change('phone')}
              error={Boolean(fields.phone)}
              helperText={fields.phone}
            />
            {!editing && (
              <>
                <PasswordTextField
                  fullWidth
                  label="First password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={change('password')}
                  error={Boolean(fields.password)}
                  helperText={fields.password ?? 'They must change it at their first login.'}
                />
                <PasswordTextField
                  fullWidth
                  label="Confirm password"
                  autoComplete="new-password"
                  value={form.passwordConfirmation}
                  onChange={change('passwordConfirmation')}
                  error={Boolean(fields.passwordConfirmation)}
                  helperText={fields.passwordConfirmation}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="soft" color="neutral" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add staff member'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StaffFormDialog;
