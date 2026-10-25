import { ReactNode } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { formatDateTime } from 'lib/format';
import { AuditLogEntry } from 'types/staff';

const Block = ({ title, data }: { title: string; data: Record<string, unknown> | null }) => (
  <Box>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>
      {title}
    </Typography>
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.elevation1',
        color: 'text.secondary',
        fontFamily: 'monospace',
        fontSize: 13,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {data ? JSON.stringify(data, null, 2) : 'Nothing recorded'}
    </Box>
  </Box>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack direction="row" spacing={2}>
    <Typography variant="subtitle2" sx={{ width: 110, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {children}
    </Typography>
  </Stack>
);

interface AuditLogDetailDialogProps {
  entry: AuditLogEntry | null;
  onClose: () => void;
}

const AuditLogDetailDialog = ({ entry, onClose }: AuditLogDetailDialogProps) => (
  <Dialog open={Boolean(entry)} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{entry?.description || entry?.action}</DialogTitle>
    <DialogContent>
      {entry && (
        <Stack direction="column" spacing={2.5} sx={{ pt: 1 }}>
          <Stack direction="column" spacing={1}>
            <Row label="Who">{entry.actorName || '-'}</Row>
            <Row label="When">{formatDateTime(entry.createdAt)}</Row>
            <Row label="Action">{entry.action}</Row>
            <Row label="IP address">{entry.ipAddress || '-'}</Row>
          </Stack>
          <Block title="Before" data={entry.before} />
          <Block title="After" data={entry.after} />
        </Stack>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 3 }}>
      <Button variant="soft" color="neutral" onClick={onClose}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default AuditLogDetailDialog;
