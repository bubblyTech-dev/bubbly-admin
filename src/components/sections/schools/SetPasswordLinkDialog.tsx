import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import CopyText from 'components/common/CopyText';

interface SetPasswordLinkDialogProps {
  // the link to show; the dialog is open while there is one
  url: string | null;
  email: string;
  onClose: () => void;
}

// Shows the one-time "set your password" link of a Principal. The link is not stored anywhere readable,
// so closing this window is the last chance to copy it.
const SetPasswordLinkDialog = ({ url, email, onClose }: SetPasswordLinkDialogProps) => (
  <Dialog open={Boolean(url)} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Set-password link</DialogTitle>
    <DialogContent>
      <Stack direction="column" spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Send this link to {email}. It works once and stops working after 7 days.
        </Typography>
        <Stack
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <CopyText value={url} />
        </Stack>
        <Alert severity="info">Shown once. Email is not set up yet.</Alert>
      </Stack>
    </DialogContent>
    <DialogActions sx={{ p: 3 }}>
      <Button variant="contained" onClick={onClose}>
        Done
      </Button>
    </DialogActions>
  </Dialog>
);

export default SetPasswordLinkDialog;
