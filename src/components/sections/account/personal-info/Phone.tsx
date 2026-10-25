import { useState } from 'react';
import { Alert, Stack, TextField } from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAccounts } from 'providers/AccountsProvider';
import { useAuth } from 'providers/AuthProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import AccountDialog from '../common/AccountDialog';
import InfoCard from '../common/InfoCard';
import InfoCardAttribute from '../common/InfoCardAttribute';

const Phone = () => {
  const { personalInfo } = useAccounts();
  const { updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(personalInfo.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleOpen = () => {
    setPhone(personalInfo.phone);
    setError('');
    setFieldError('');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleConfirm = async () => {
    setError('');
    setFieldError('');
    setSaving(true);
    try {
      await updateProfile({ phone }); // an empty value clears the number
      setOpen(false);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFieldError(info.fields.phone ?? '');
    }
    setSaving(false);
  };

  return (
    <>
      <InfoCard setOpen={() => handleOpen()}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Number" value={personalInfo.phone || '-'} />
        </Stack>
        <IconifyIcon
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: 'neutral.dark', visibility: 'hidden' }}
        />
      </InfoCard>
      <AccountDialog
        title="Phone"
        subtitle="Add a phone number your team can reach you on. Leave it empty to remove it."
        open={open}
        confirming={saving}
        handleConfirm={handleConfirm}
        handleDialogClose={handleClose}
        handleDiscard={handleClose}
        sx={{ maxWidth: 463 }}
      >
        <Stack direction="column" spacing={1} p={0.125}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            placeholder="Phone"
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={Boolean(fieldError)}
            helperText={fieldError}
            fullWidth
          />
        </Stack>
      </AccountDialog>
    </>
  );
};

export default Phone;
