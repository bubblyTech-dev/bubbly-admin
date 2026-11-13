import { useState } from 'react';
import { Alert, Box, Button, Stack } from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import PasswordTextField from 'components/common/PasswordTextField';

const ChangePassword = () => {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFields({});
    setDone(false);
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword, newPasswordConfirmation: confirmation });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      setDone(true);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSubmitting(false);
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack direction="column" spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}
        {done && (
          <Alert severity="success">Password changed. Your other devices were signed out.</Alert>
        )}
        <PasswordTextField
          fullWidth
          id="currentPassword"
          label="Current password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={Boolean(fields.currentPassword)}
          helperText={fields.currentPassword}
        />
        <PasswordTextField
          fullWidth
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={Boolean(fields.newPassword)}
          helperText={fields.newPassword}
        />
        <PasswordTextField
          fullWidth
          id="newPasswordConfirmation"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          error={Boolean(fields.newPasswordConfirmation)}
          helperText={fields.newPasswordConfirmation}
        />
        <Box>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Change password'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ChangePassword;
