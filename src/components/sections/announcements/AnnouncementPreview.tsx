import { Alert, AlertTitle, Typography } from '@mui/material';
import { ANNOUNCEMENT_TYPE, announcementTypeLabels } from 'types/announcements';

interface AnnouncementPreviewProps {
  title: string;
  body: string;
  type: number;
}

// roughly how the notice will look to a school: the theme's Alert, coloured by type
const AnnouncementPreview = ({ title, body, type }: AnnouncementPreviewProps) => {
  const severity =
    type === ANNOUNCEMENT_TYPE.WARNING
      ? 'warning'
      : type === ANNOUNCEMENT_TYPE.MAINTENANCE
        ? 'error'
        : 'info';

  return (
    <Alert severity={severity} sx={{ alignItems: 'flex-start' }}>
      <AlertTitle>{title || announcementTypeLabels[type]}</AlertTitle>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {body || 'Your message will appear here.'}
      </Typography>
    </Alert>
  );
};

export default AnnouncementPreview;
