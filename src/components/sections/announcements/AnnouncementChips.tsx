import { Chip } from '@mui/material';
import {
  ANNOUNCEMENT_STATUS,
  ANNOUNCEMENT_TYPE,
  announcementStatusLabels,
  announcementTypeLabels,
} from 'types/announcements';

export const AnnouncementStatusChip = ({ status }: { status: number }) => {
  const color =
    status === ANNOUNCEMENT_STATUS.PUBLISHED
      ? 'success'
      : status === ANNOUNCEMENT_STATUS.SCHEDULED
        ? 'info'
        : 'default';

  return (
    <Chip
      size="small"
      variant="outlined"
      color={color}
      label={announcementStatusLabels[status] ?? 'Unknown'}
    />
  );
};

export const AnnouncementTypeChip = ({ type }: { type: number }) => {
  const color =
    type === ANNOUNCEMENT_TYPE.WARNING
      ? 'warning'
      : type === ANNOUNCEMENT_TYPE.MAINTENANCE
        ? 'error'
        : 'info';

  return <Chip size="small" color={color} label={announcementTypeLabels[type] ?? 'Unknown'} />;
};
