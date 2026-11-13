import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, Link, Stack } from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import { landingPath } from 'routes/landing';
import paths from 'routes/paths';
import PasswordTextField from 'components/common/PasswordTextField';
import AuthCard from './AuthCard';

// Shown right after login while the account is flagged "must change password" (first login of a seeded or new admin).
const ChangePasswordForm = () => {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFields({});
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword, newPasswordConfirmation: confirmation });
      navigate(user ? landingPath(user) : paths.root, { replace: true });
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Change your password"
      subtitle="For your security, please set a new password before continuing."
      footer={
        <Link component="button" type="button" variant="subtitle2" onClick={() => void logout()}>
          Log out
        </Link>
      }
    >
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Stack direction="column" spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <PasswordTextField
            fullWidth
            size="large"
            id="currentPassword"
            label="Current password"
            autoComplete="current-password"
            autoFocus
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={Boolean(fields.currentPassword)}
            helperText={fields.currentPassword}
          />
          <PasswordTextField
            fullWidth
            size="large"
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
            size="large"
            id="newPasswordConfirmation"
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            error={Boolean(fields.newPasswordConfirmation)}
            helperText={fields.newPasswordConfirmation}
          />
          <Button fullWidth type="submit" size="large" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Change password'}
          </Button>
        </Stack>
      </Box>
    </AuthCard>
  );
};

export default ChangePasswordForm;
