import { useState } from 'react';
import { Alert, Stack, TextField } from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAccounts } from 'providers/AccountsProvider';
import { useAuth } from 'providers/AuthProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import AccountDialog from '../common/AccountDialog';
import InfoCard from '../common/InfoCard';
import InfoCardAttribute from '../common/InfoCardAttribute';

const Names = () => {
  const { personalInfo } = useAccounts();
  const { updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(personalInfo.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleOpen = (value: boolean) => {
    if (value) {
      setName(personalInfo.name);
      setError('');
      setFieldError('');
    }
    setOpen(value);
  };

  const handleClose = () => setOpen(false);

  const handleConfirm = async () => {
    setError('');
    setFieldError('');
    setSaving(true);
    try {
      await updateProfile({ name });
      setOpen(false);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFieldError(info.fields.name ?? '');
    }
    setSaving(false);
  };

  return (
    <>
      <InfoCard setOpen={() => handleOpen(true)}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Name" value={personalInfo.name || '-'} />
        </Stack>
        <IconifyIcon
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: 'neutral.dark', visibility: 'hidden' }}
        />
      </InfoCard>
      <AccountDialog
        title="Name"
        subtitle="Enter your updated name below. It is shown across the admin panel."
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
            placeholder="Name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(fieldError)}
            helperText={fieldError}
            fullWidth
          />
        </Stack>
      </AccountDialog>
    </>
  );
};

export default Names;
