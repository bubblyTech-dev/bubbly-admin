import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router';
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import { landingPath } from 'routes/landing';
import paths from 'routes/paths';
import PasswordTextField from 'components/common/PasswordTextField';
import AuthCard from './AuthCard';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFields({});
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(user.mustChangePassword ? paths.changePassword : (from ?? landingPath(user)), {
        replace: true,
      });
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Log in" subtitle="Sign in to the Bubbly admin panel.">
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
            error={Boolean(fields.email)}
            helperText={fields.email}
          />
          <PasswordTextField
            fullWidth
            size="large"
            id="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(fields.password)}
            helperText={fields.password}
          />
          <Link
            component={RouterLink}
            to={paths.forgotPassword}
            variant="subtitle2"
            sx={{ alignSelf: 'center' }}
          >
            Forgot Password?
          </Link>
          <Button fullWidth type="submit" size="large" variant="contained" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </Button>
        </Stack>
      </Box>
    </AuthCard>
  );
};

export default LoginForm;
