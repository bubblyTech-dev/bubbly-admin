import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { parseApiError } from 'lib/api';
import { formatDateTime } from 'lib/format';
import { billingService } from 'services/billingService';
import { WebhookEvent } from 'types/billing';
import CopyText from 'components/common/CopyText';
import { WebhookStatusChip } from './BillingChips';
import DetailField from './DetailField';

interface WebhookEventDialogProps {
  uuid: string | null;
  onClose: () => void;
}

// One stored webhook call: when it came, what happened to it and the exact event Razorpay sent.
const WebhookEventDialog = ({ uuid, onClose }: WebhookEventDialogProps) => {
  const [event, setEvent] = useState<WebhookEvent | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uuid) return undefined;
    let active = true;
    setEvent(null);
    setError('');

    billingService
      .getEvent(uuid)
      .then((result) => {
        if (active) setEvent(result);
      })
      .catch((err) => {
        if (active) setError(parseApiError(err).message);
      });

    return () => {
      active = false;
    };
  }, [uuid]);

  return (
    <Dialog open={Boolean(uuid)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Webhook event</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        {event && (
          <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
            <WebhookStatusChip status={event.status} />

            {event.errorMessage && <Alert severity="error">{event.errorMessage}</Alert>}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Event">{event.eventType}</DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailField label="Event id">
                  <CopyText value={event.eventId} />
                </DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailField label="Received">{formatDateTime(event.receivedAt)}</DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailField label="Processed">{formatDateTime(event.processedAt)}</DetailField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailField label="Attempts">{event.attempts}</DetailField>
              </Grid>
            </Grid>

            <DetailField label="Payload">
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  maxHeight: 360,
                  overflow: 'auto',
                  borderRadius: 2,
                  bgcolor: 'background.elevation1',
                  fontSize: 12,
                }}
              >
                {JSON.stringify(event.payload, null, 2)}
              </Box>
            </DetailField>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebhookEventDialog;
