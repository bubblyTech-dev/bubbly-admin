import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  FormHelperText,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { parseApiError } from 'lib/api';
import { isoToLocalInput, localInputToIso } from 'lib/datetimeLocal';
import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import { announcementService } from 'services/announcementService';
import {
  ANNOUNCEMENT_STATUS,
  ANNOUNCEMENT_TARGET_TYPE,
  ANNOUNCEMENT_TYPE,
  Announcement,
  AnnouncementInput,
  announcementTargetLabels,
  announcementTypeLabels,
} from 'types/announcements';
import IconifyIcon from 'components/base/IconifyIcon';
import PageLoader from 'components/loading/PageLoader';
import { AnnouncementStatusChip } from 'components/sections/announcements/AnnouncementChips';
import AnnouncementPreview from 'components/sections/announcements/AnnouncementPreview';

// New announcement (/announcements/new) and edit (/announcements/:uuid) share this form.
const AnnouncementForm = () => {
  const { uuid } = useParams();
  const isNew = !uuid;
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission('announcements.manage');

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<number>(ANNOUNCEMENT_TYPE.INFO);
  const [targetType, setTargetType] = useState<number>(ANNOUNCEMENT_TARGET_TYPE.ALL);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');

  const fill = (data: Announcement) => {
    setAnnouncement(data);
    setTitle(data.title);
    setBody(data.body);
    setType(data.type);
    setTargetType(data.targetType);
    setStartsAt(isoToLocalInput(data.startsAt));
    setEndsAt(isoToLocalInput(data.endsAt));
  };

  useEffect(() => {
    if (!uuid) return;
    announcementService
      .get(uuid)
      .then(fill)
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false));
  }, [uuid]);

  const status = announcement?.status ?? ANNOUNCEMENT_STATUS.DRAFT;
  const isPublished = status === ANNOUNCEMENT_STATUS.PUBLISHED;
  const isExpired = status === ANNOUNCEMENT_STATUS.EXPIRED;
  // a published notice can only get a new end time; an expired one has to be unpublished first
  const lockContent = !canManage || isPublished || isExpired;
  const lockEnd = !canManage || isExpired;

  const buildInput = (): AnnouncementInput =>
    isPublished
      ? { endsAt: localInputToIso(endsAt) }
      : {
          title,
          body,
          type,
          targetType,
          startsAt: localInputToIso(startsAt),
          endsAt: localInputToIso(endsAt),
        };

  const run = async (action: () => Promise<Announcement>, message: string, goToList = false) => {
    setSaving(true);
    setError('');
    setFields({});
    setNotice('');
    try {
      const saved = await action();
      if (goToList) {
        navigate(paths.announcements);
        return;
      }
      fill(saved);
      setNotice(message);
      if (isNew) navigate(`/announcements/${saved.uuid}`, { replace: true });
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      setFields(info.fields);
    }
    setSaving(false);
  };

  const handleSave = () =>
    run(
      () =>
        isNew
          ? announcementService.create(buildInput())
          : announcementService.update(uuid, buildInput()),
      'Saved.',
    );

  // saves what is on screen, then publishes
  const handlePublish = () =>
    run(async () => {
      const saved = isNew
        ? await announcementService.create(buildInput())
        : await announcementService.update(uuid, buildInput());
      return announcementService.publish(saved.uuid);
    }, 'Published.');

  const handleUnpublish = () =>
    run(() => announcementService.unpublish(uuid as string), 'Moved back to draft.');

  if (loading) return <PageLoader sx={{ minHeight: 320 }} />;

  return (
    <Paper sx={{ p: { xs: 3, md: 5 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 4 }}>
        <IconButton aria-label="Back" onClick={() => navigate(paths.announcements)} sx={{ ml: -1 }}>
          <IconifyIcon icon="material-symbols:arrow-back-rounded" />
        </IconButton>
        <Typography variant="h4">{isNew ? 'New announcement' : 'Edit announcement'}</Typography>
        {announcement && <AnnouncementStatusChip status={status} />}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {notice}
        </Alert>
      )}
      {isPublished && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This announcement is live. You can only change when it ends. Unpublish it to edit anything
          else.
        </Alert>
      )}
      {isExpired && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This announcement has expired. Unpublish it to edit it and publish it again.
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack direction="column" spacing={3}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              disabled={lockContent}
              onChange={(e) => setTitle(e.target.value)}
              error={Boolean(fields.title)}
              helperText={fields.title}
            />
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Message"
              value={body}
              disabled={lockContent}
              onChange={(e) => setBody(e.target.value)}
              error={Boolean(fields.body)}
              helperText={fields.body}
            />
            <TextField
              select
              fullWidth
              label="Type"
              value={type}
              disabled={lockContent}
              onChange={(e) => setType(Number(e.target.value))}
              error={Boolean(fields.type)}
              helperText={fields.type}
            >
              {Object.entries(announcementTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <Box>
              <TextField
                select
                fullWidth
                label="Audience"
                value={targetType}
                disabled={lockContent}
                onChange={(e) => setTargetType(Number(e.target.value))}
                error={Boolean(fields.targetType || fields.targetUuids)}
                helperText={fields.targetType || fields.targetUuids}
              >
                {Object.entries(announcementTargetLabels).map(([value, label]) => (
                  <MenuItem
                    key={value}
                    value={Number(value)}
                    disabled={Number(value) !== ANNOUNCEMENT_TARGET_TYPE.ALL}
                  >
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <FormHelperText sx={{ mx: 1.75 }}>
                Choosing selected schools or plans is available after Schools and Plans are
                connected.
              </FormHelperText>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Visible from"
                value={startsAt}
                disabled={lockContent}
                onChange={(e) => setStartsAt(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(fields.startsAt)}
                helperText={fields.startsAt || 'Leave empty to start when you publish.'}
              />
              <TextField
                fullWidth
                type="datetime-local"
                label="Visible until"
                value={endsAt}
                disabled={lockEnd}
                onChange={(e) => setEndsAt(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(fields.endsAt)}
                helperText={fields.endsAt || 'Leave empty for no end.'}
              />
            </Stack>

            {canManage && (
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2 }}>
                {!isExpired && (
                  <Button variant="contained" disabled={saving} onClick={handleSave}>
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                )}
                {(isNew || status === ANNOUNCEMENT_STATUS.DRAFT) && (
                  <Button variant="soft" color="primary" disabled={saving} onClick={handlePublish}>
                    Save and publish
                  </Button>
                )}
                {!isNew && status !== ANNOUNCEMENT_STATUS.DRAFT && (
                  <Button
                    variant="soft"
                    color="neutral"
                    disabled={saving}
                    onClick={handleUnpublish}
                  >
                    Unpublish
                  </Button>
                )}
                <Button
                  variant="text"
                  color="neutral"
                  onClick={() => navigate(paths.announcements)}
                >
                  Close
                </Button>
              </Stack>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Preview
          </Typography>
          <AnnouncementPreview title={title} body={body} type={type} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AnnouncementForm;
