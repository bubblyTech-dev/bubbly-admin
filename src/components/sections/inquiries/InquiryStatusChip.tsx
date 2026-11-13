import { Chip, ChipProps } from '@mui/material';
import { INQUIRY_STATUS_LABELS } from 'types/inquiries';

const COLORS: Record<number, ChipProps['color']> = {
  1: 'primary',
  2: 'warning',
  3: 'success',
  4: 'default',
};

const InquiryStatusChip = ({ status }: { status: number }) => (
  <Chip
    size="small"
    color={COLORS[status] ?? 'default'}
    label={INQUIRY_STATUS_LABELS[status] ?? 'Unknown'}
  />
);

export default InquiryStatusChip;
