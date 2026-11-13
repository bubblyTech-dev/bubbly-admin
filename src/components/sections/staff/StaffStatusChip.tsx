import { Chip } from '@mui/material';
import { StaffStatus } from 'types/staff';

const statuses: Record<StaffStatus, { label: string; color: 'success' | 'neutral' | 'warning' }> = {
  1: { label: 'Active', color: 'success' },
  2: { label: 'Inactive', color: 'neutral' },
  3: { label: 'Locked', color: 'warning' },
};

const StaffStatusChip = ({ status }: { status: StaffStatus }) => {
  const { label, color } = statuses[status] ?? statuses[2];
  return <Chip size="small" label={label} color={color} />;
};

export default StaffStatusChip;
