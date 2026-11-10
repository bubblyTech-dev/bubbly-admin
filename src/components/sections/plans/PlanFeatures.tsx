import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const MAX_FEATURES = 30;
const MAX_LENGTH = 200;

interface PlanFeaturesProps {
  features: string[];
  onChange: (features: string[]) => void;
  readOnly?: boolean;
  // an error from the server about the list, shown above it
  error?: string;
}

// The plan's feature list: short text lines shown on the pricing page. "Add feature" opens a small popup.
const PlanFeatures = ({ features, onChange, readOnly = false, error }: PlanFeaturesProps) => {
  // index -1 adds a new line, any other index edits that line, null keeps the popup closed
  const [editing, setEditing] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [problem, setProblem] = useState('');

  const openAdd = () => {
    setText('');
    setProblem('');
    setEditing(-1);
  };

  const openEdit = (index: number) => {
    setText(features[index]);
    setProblem('');
    setEditing(index);
  };

  const close = () => setEditing(null);

  const save = () => {
    if (editing === null) return;

    const value = text.trim().replace(/\s+/g, ' ');
    if (!value) {
      setProblem('Enter the feature text.');
      return;
    }
    if (value.length > MAX_LENGTH) {
      setProblem(`Use at most ${MAX_LENGTH} characters.`);
      return;
    }
    const repeated = features.some(
      (existing, index) => index !== editing && existing.toLowerCase() === value.toLowerCase(),
    );
    if (repeated) {
      setProblem('This feature is already in the list.');
      return;
    }

    if (editing === -1) onChange([...features, value]);
    else onChange(features.map((existing, index) => (index === editing ? value : existing)));
    close();
  };

  const remove = (index: number) => onChange(features.filter((_, position) => position !== index));

  const move = (index: number, step: -1 | 1) => {
    const target = index + step;
    if (target < 0 || target >= features.length) return;
    const next = [...features];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Features</Typography>
        {!readOnly && (
          <Button
            variant="soft"
            startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
            onClick={openAdd}
            disabled={features.length >= MAX_FEATURES}
          >
            Add feature
          </Button>
        )}
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Short lines shown on the pricing page, for example "Unlimited attendance records". They are
        only a description and do not switch anything on or off.
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {features.length === 0 ? (
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderStyle: 'dashed',
            borderRadius: 2,
            py: 4,
            px: 2,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          No features yet. Add the things this plan includes.
        </Box>
      ) : (
        <Stack
          direction="column"
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
        >
          {features.map((feature, index) => (
            <Stack
              key={feature}
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                px: 2,
                py: 1,
                borderTop: index === 0 ? 0 : 1,
                borderColor: 'divider',
              }}
            >
              <IconifyIcon
                icon="material-symbols:check-circle-outline-rounded"
                sx={{ fontSize: 20, color: 'success.main', flexShrink: 0 }}
              />
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                {feature}
              </Typography>
              {!readOnly && (
                <Stack direction="row" sx={{ flexShrink: 0 }}>
                  <IconButton
                    size="small"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <IconifyIcon icon="material-symbols:keyboard-arrow-up-rounded" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Move down"
                    disabled={index === features.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <IconifyIcon icon="material-symbols:keyboard-arrow-down-rounded" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Edit feature"
                    onClick={() => openEdit(index)}
                  >
                    <IconifyIcon icon="material-symbols:edit-outline-rounded" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Delete feature"
                    onClick={() => remove(index)}
                  >
                    <IconifyIcon icon="material-symbols:delete-outline-rounded" />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          ))}
        </Stack>
      )}

      <Dialog open={editing !== null} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>{editing === -1 ? 'Add feature' : 'Edit feature'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            id="plan-feature"
            label="Feature"
            placeholder="Unlimited attendance records"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setProblem('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                save();
              }
            }}
            error={Boolean(problem)}
            helperText={problem || `${text.length}/${MAX_LENGTH}`}
            slotProps={{ htmlInput: { maxLength: MAX_LENGTH } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="soft" color="neutral" onClick={close}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save}>
            {editing === -1 ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PlanFeatures;
