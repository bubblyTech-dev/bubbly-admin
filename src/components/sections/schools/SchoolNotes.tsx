import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { parseApiError } from 'lib/api';
import { schoolService } from 'services/schoolService';
import { PageMeta, SchoolNote } from 'types/school';
import TablePager from 'components/common/TablePager';
import PageLoader from 'components/loading/PageLoader';

const PER_PAGE = 10;

// Internal notes about a school. Only Bubbly staff see them.
const SchoolNotes = ({ schoolUuid }: { schoolUuid: string }) => {
  const [notes, setNotes] = useState<SchoolNote[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const load = useCallback(
    async (target: number) => {
      setLoading(true);
      try {
        const result = await schoolService.notes(schoolUuid, { page: target, perPage: PER_PAGE });
        setNotes(result.data);
        setMeta(result.meta);
      } catch (err) {
        setError(parseApiError(err).message);
      }
      setLoading(false);
    },
    [schoolUuid],
  );

  useEffect(() => {
    void load(page);
  }, [load, page]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSaving(true);
    try {
      await schoolService.addNote(schoolUuid, text);
      setText('');
      if (page === 1) await load(1);
      else setPage(1);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFieldError(info.fields.note ?? '');
    }
    setSaving(false);
  };

  return (
    <Stack direction="column" spacing={3}>
      <Box component="form" noValidate onSubmit={handleAdd}>
        <Stack direction="column" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            id="school-note"
            label="Add a note"
            value={text}
            onChange={(e) => setText(e.target.value)}
            error={Boolean(fieldError)}
            helperText={fieldError}
          />
          <Button type="submit" variant="contained" disabled={saving || !text.trim()}>
            {saving ? 'Adding…' : 'Add note'}
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <PageLoader sx={{ py: 4 }} />
      ) : (
        <Stack direction="column" spacing={2}>
          {notes.map((note) => (
            <Paper key={note.uuid} background={1} sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                {note.note}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {note.createdBy?.name || 'Unknown'} ·{' '}
                {dayjs(note.createdAt).format('DD MMM YYYY, hh:mm A')}
              </Typography>
            </Paper>
          ))}
          {notes.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No notes yet.
            </Typography>
          )}
        </Stack>
      )}

      {meta && (
        <TablePager page={meta.page} perPage={meta.perPage} total={meta.total} onChange={setPage} />
      )}
    </Stack>
  );
};

export default SchoolNotes;
