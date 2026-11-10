import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { parseApiError } from 'lib/api';
import { formatDateTime } from 'lib/format';
import { useAuth } from 'providers/AuthProvider';
import { principalService } from 'services/principalService';
import { SchoolPrincipal } from 'types/principal';
import IconifyIcon from 'components/base/IconifyIcon';
import ConfirmDialog from 'components/common/ConfirmDialog';
import SetPasswordLinkDialog from './SetPasswordLinkDialog';

interface SchoolPrincipalCardProps {
  schoolUuid: string;
}

type Action = 'resend' | 'reset';

const COPY: Record<
  Action,
  { title: string; message: string; confirm: string; color: 'primary' | 'error' }
> = {
  resend: {
    title: 'Send a new welcome link?',
    message: 'A new link is created and emailed to the Principal. Older unused links stop working.',
    confirm: 'Resend welcome link',
    color: 'primary',
  },
  reset: {
    title: 'Reset the Principal password?',
    message:
      'The current password stops working and the Principal is signed out on every device. They set a new password from a new link.',
    confirm: 'Reset password',
    color: 'error',
  },
};

// The Principal section of a school's Overview tab: who they are, whether they have set a password,
// and the two things staff can do when they cannot get in.
const SchoolPrincipalCard = ({ schoolUuid }: SchoolPrincipalCardProps) => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('schools.edit');

  const [principal, setPrincipal] = useState<SchoolPrincipal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [asking, setAsking] = useState<Action | null>(null);
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState('');
  const [link, setLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPrincipal(await principalService.get(schoolUuid));
      setError('');
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, [schoolUuid]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async () => {
    if (!asking) return;
    setWorking(true);
    setActionError('');
    try {
      const result =
        asking === 'resend'
          ? await principalService.resendWelcome(schoolUuid)
          : await principalService.resetPassword(schoolUuid);
      setAsking(null);
      // the link lives only in this state until the window is closed
      setLink(result.setPasswordUrl ?? null);
      await load();
    } catch (err) {
      setActionError(parseApiError(err).message);
    }
    setWorking(false);
  };

  const ask = (action: Action) => {
    setActionError('');
    setAsking(action);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6">Principal</Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {loading && !principal && <Skeleton variant="rounded" height={64} />}

        {!loading && !error && !principal && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            There is no Principal login yet. It is created when the first subscription becomes
            active.
          </Typography>
        )}

        {principal && (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
          >
            <Stack direction="column" spacing={0.5} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1">{principal.name || principal.email}</Typography>
                <Chip
                  size="small"
                  color={principal.hasPassword ? 'success' : 'warning'}
                  label={principal.hasPassword ? 'Password set' : 'Waiting for first login'}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
                {principal.email}
                {principal.phone ? ` · ${principal.phone}` : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Last login: {formatDateTime(principal.lastLoginAt)}
                {principal.welcomeLinkSentAt
                  ? ` · Link sent ${formatDateTime(principal.welcomeLinkSentAt)}`
                  : ''}
                {principal.welcomeLinkExpiresAt
                  ? ` · expires ${formatDateTime(principal.welcomeLinkExpiresAt)}`
                  : ''}
              </Typography>
            </Stack>

            {canEdit && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="soft"
                  color="neutral"
                  startIcon={<IconifyIcon icon="material-symbols:mail-outline" />}
                  onClick={() => ask('resend')}
                >
                  Resend welcome link
                </Button>
                <Button
                  variant="soft"
                  color="error"
                  startIcon={<IconifyIcon icon="material-symbols:lock-outline" />}
                  onClick={() => ask('reset')}
                >
                  Reset password
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      <ConfirmDialog
        open={Boolean(asking)}
        title={asking ? COPY[asking].title : ''}
        message={asking ? COPY[asking].message : ''}
        confirmLabel={asking ? COPY[asking].confirm : 'Confirm'}
        color={asking ? COPY[asking].color : 'primary'}
        loading={working}
        error={actionError}
        onConfirm={() => void run()}
        onClose={() => setAsking(null)}
      />

      <SetPasswordLinkDialog
        url={link}
        email={principal?.email ?? ''}
        onClose={() => setLink(null)}
      />
    </Paper>
  );
};

export default SchoolPrincipalCard;
