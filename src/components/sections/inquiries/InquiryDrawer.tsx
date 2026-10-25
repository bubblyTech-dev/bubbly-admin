import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { parseApiError } from 'lib/api';
import { useAuth } from 'providers/AuthProvider';
import { inquiryService } from 'services/inquiryService';
import {
  INQUIRY_SOURCE_LABELS,
  INQUIRY_STATUS,
  INQUIRY_STATUS_LABELS,
  Inquiry,
  InquiryAssignee,
  InquiryNote,
} from 'types/inquiries';
import IconifyIcon from 'components/base/IconifyIcon';
import InquiryStatusChip from './InquiryStatusChip';

interface InquiryDrawerProps {
  uuid: string | null;
  onClose: () => void;
  // called after anything changed, so the list and the sidebar badge can refresh
  onChanged: () => void;
}

const UNASSIGNED = 'none';

const formatDate = (value: string) => new Date(value).toLocaleString();

const InquiryDrawer = ({ uuid, onClose, onChanged }: InquiryDrawerProps) => {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('inquiries.manage');

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState<InquiryNote[]>([]);
  const [assignees, setAssignees] = useState<InquiryAssignee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteError, setNoteError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async (target: string) => {
    setLoading(true);
    setError('');
    try {
      const [detail, noteList] = await Promise.all([
        inquiryService.show(target),
        inquiryService.notes(target),
      ]);
      setInquiry(detail);
      setNotes(noteList);
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setInquiry(null);
    setNotes([]);
    setNoteText('');
    setNoteError('');
    setError('');
    if (uuid) void load(uuid);
  }, [uuid, load]);

  useEffect(() => {
    if (!uuid || !canManage) return;
    inquiryService
      .assignees()
      .then(setAssignees)
      .catch(() => setAssignees([]));
  }, [uuid, canManage]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(parseApiError(err).message);
    }
    setBusy(false);
  };

  const handleStatus = (status: number) =>
    run(async () => {
      if (inquiry) setInquiry(await inquiryService.updateStatus(inquiry.uuid, status));
    });

  const handleAssign = (value: string) =>
    run(async () => {
      if (inquiry)
        setInquiry(await inquiryService.assign(inquiry.uuid, value === UNASSIGNED ? null : value));
    });

  const handleAddNote = async () => {
    if (!inquiry || !noteText.trim()) return;
    setNoteError('');
    setBusy(true);
    try {
      const created = await inquiryService.addNote(inquiry.uuid, noteText.trim());
      setNotes((current) => [created, ...current]);
      setNoteText('');
    } catch (err) {
      const info = parseApiError(err);
      setNoteError(info.fields.note ?? info.message);
    }
    setBusy(false);
  };

  const handleDelete = () =>
    run(async () => {
      if (!inquiry) return;
      await inquiryService.remove(inquiry.uuid);
      setConfirmDelete(false);
      onClose();
    });

  const canDelete =
    canManage &&
    inquiry &&
    (inquiry.status === INQUIRY_STATUS.RESOLVED || inquiry.status === INQUIRY_STATUS.SPAM);

  return (
    <Drawer
      anchor="right"
      open={Boolean(uuid)}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: 1, sm: 480 } } } }}
    >
      <Stack direction="column" sx={{ height: 1 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}
        >
          <Typography variant="h6">Inquiry</Typography>
          <IconButton onClick={onClose} aria-label="Close">
            <IconifyIcon icon="material-symbols:close-rounded" />
          </IconButton>
        </Stack>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {loading && (
            <Stack sx={{ alignItems: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Stack>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {inquiry && (
            <Stack direction="column" spacing={3}>
              <Stack direction="column" spacing={0.5}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="h6">{inquiry.name}</Typography>
                  <InquiryStatusChip status={inquiry.status} />
                </Stack>
                {inquiry.schoolName && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {inquiry.schoolName}
                  </Typography>
                )}
                <Link href={`mailto:${inquiry.email}`} variant="body2">
                  {inquiry.email}
                </Link>
                {inquiry.phone && (
                  <Link href={`tel:${inquiry.phone}`} variant="body2">
                    {inquiry.phone}
                  </Link>
                )}
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {INQUIRY_SOURCE_LABELS[inquiry.source]} · received {formatDate(inquiry.createdAt)}
                </Typography>
              </Stack>

              <Paper background={1} sx={{ p: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {inquiry.message}
                </Typography>
              </Paper>

              {canManage && (
                <Stack direction="column" spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={inquiry.status}
                    disabled={busy}
                    onChange={(e) => void handleStatus(Number(e.target.value))}
                  >
                    {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Assigned to"
                    value={inquiry.assignedTo?.uuid ?? UNASSIGNED}
                    disabled={busy}
                    onChange={(e) => void handleAssign(e.target.value)}
                  >
                    <MenuItem value={UNASSIGNED}>Unassigned</MenuItem>
                    {assignees.map((person) => (
                      <MenuItem key={person.uuid} value={person.uuid}>
                        {person.name || person.email}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              )}

              {!canManage && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Status: {INQUIRY_STATUS_LABELS[inquiry.status]} · Assigned to:{' '}
                  {inquiry.assignedTo
                    ? inquiry.assignedTo.name || inquiry.assignedTo.email
                    : 'Unassigned'}
                </Typography>
              )}

              <Divider />

              <Stack direction="column" spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Notes
                </Typography>

                {canManage && (
                  <Stack direction="column" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Add an internal note"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      error={Boolean(noteError)}
                      helperText={noteError}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      disabled={busy || !noteText.trim()}
                      onClick={() => void handleAddNote()}
                    >
                      Add note
                    </Button>
                  </Stack>
                )}

                {notes.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No notes yet.
                  </Typography>
                )}
                {notes.map((note) => (
                  <Paper key={note.uuid} background={1} sx={{ p: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {note.note}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {note.author?.name || 'Staff'} · {formatDate(note.createdAt)}
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              {canDelete && (
                <>
                  <Divider />
                  <Box>
                    <Button
                      color="error"
                      variant="soft"
                      onClick={() => setConfirmDelete(true)}
                      disabled={busy}
                    >
                      Delete inquiry
                    </Button>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </Box>
      </Stack>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete this inquiry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            It will be removed from the inbox. This cannot be undone from the app.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="soft"
            color="neutral"
            onClick={() => setConfirmDelete(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDelete()}
            disabled={busy}
          >
            {busy ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default InquiryDrawer;
