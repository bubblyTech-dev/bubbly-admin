import { ReactNode } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  color?: 'primary' | 'error';
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

// A yes/no question before something that cannot be undone easily.
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  color = 'primary',
  loading = false,
  error = '',
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ p: 3 }}>
      <Button variant="soft" color="neutral" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button variant="contained" color={color} onClick={onConfirm} disabled={loading}>
        {loading ? 'Please wait…' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
