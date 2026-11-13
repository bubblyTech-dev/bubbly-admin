import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { schoolService } from 'services/schoolService';
import { School, SchoolStatus } from 'types/school';
import { schoolStatusAction, schoolStatusLabel, schoolStatusTargets } from './schoolStatus';

interface StatusChangeDialogProps {
  open: boolean;
  school: School;
  onClose: () => void;
  onChanged: (school: School) => void;
}

// Suspend, reactivate or archive a school. A reason is required and is kept in the status history.
const StatusChangeDialog = ({ open, school, onClose, onChanged }: StatusChangeDialogProps) => {
  const targets = schoolStatusTargets[school.status];

  const [target, setTarget] = useState<SchoolStatus>(targets[0]);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  // start fresh each time the dialog opens
  useEffect(() => {
    if (!open) return;
    setTarget(schoolStatusTargets[school.status][0]);
    setReason('');
    setError('');
    setFields({});
  }, [open, school.status]);

  const handleConfirm = async () => {
    setError('');
    setFields({});
    setSaving(true);
    try {
      onChanged(await schoolService.changeStatus(school.uuid, target, reason));
      onClose();
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Change status</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {school.name} is {schoolStatusLabel[school.status].toLowerCase()}. The reason is saved in
          the status history.
        </DialogContentText>
        <Stack direction="column" spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            fullWidth
            id="status-action"
            label="Action"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value) as SchoolStatus)}
            error={Boolean(fields.status)}
            helperText={fields.status}
          >
            {targets.map((value) => (
              <MenuItem key={value} value={value}>
                {schoolStatusAction(value)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            minRows={3}
            id="status-reason"
            label="Reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={Boolean(fields.reason)}
            helperText={fields.reason}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="soft" color="neutral" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={saving}>
          {saving ? 'Saving…' : schoolStatusAction(target)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusChangeDialog;
