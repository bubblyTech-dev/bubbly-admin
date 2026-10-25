import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router';
import { Alert, Box, Button, Link, Stack } from '@mui/material';
import { parseApiError } from 'lib/api';
import paths from 'routes/paths';
import { authService } from 'services/authService';
import PasswordTextField from 'components/common/PasswordTextField';
import AuthCard from './AuthCard';

const ResetPasswordForm = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [done, setDone] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFields({});
    setSubmitting(true);
    try {
      setDone(
        await authService.resetPassword({ token, password, passwordConfirmation: confirmation }),
      );
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSubmitting(false);
  };

  const loginLink = (
    <Link component={RouterLink} to={paths.login} variant="subtitle2">
      Back to log in
    </Link>
  );

  if (!token) {
    return (
      <AuthCard title="Reset password" footer={loginLink}>
        <Alert severity="error">
          This reset link is invalid or incomplete. Please request a new one.
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Choose a new password for your account."
      footer={loginLink}
    >
      {done ? (
        <Alert severity="success">{done}</Alert>
      ) : (
        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Stack direction="column" spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            <PasswordTextField
              fullWidth
              size="large"
              id="password"
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
              size="large"
              id="passwordConfirmation"
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              error={Boolean(fields.passwordConfirmation)}
              helperText={fields.passwordConfirmation}
            />
            <Button fullWidth type="submit" size="large" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Set new password'}
            </Button>
          </Stack>
        </Box>
      )}
    </AuthCard>
  );
};

export default ResetPasswordForm;
