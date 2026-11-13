import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material';
import { parseApiError } from 'lib/api';
import paths from 'routes/paths';
import { authService } from 'services/authService';
import AuthCard from './AuthCard';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [done, setDone] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSubmitting(true);
    try {
      setDone(await authService.forgotPassword(email));
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFieldError(info.fields.email ?? '');
    }
    setSubmitting(false);
  };

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we will send you a link to set a new password."
      footer={
        <Link component={RouterLink} to={paths.login} variant="subtitle2">
          Back to log in
        </Link>
      }
    >
      {done ? (
        <Alert severity="success">{done}</Alert>
      ) : (
        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Stack direction="column" spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              fullWidth
              size="large"
              id="email"
              type="email"
              label="Email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(fieldError)}
              helperText={fieldError}
            />
            <Button fullWidth type="submit" size="large" variant="contained" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </Stack>
        </Box>
      )}
    </AuthCard>
  );
};

export default ForgotPasswordForm;
