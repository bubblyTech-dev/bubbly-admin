import { Chip } from '@mui/material';
import { PlanStatus } from 'types/plans';

const statuses: Record<PlanStatus, { label: string; color: 'default' | 'success' | 'warning' }> = {
  1: { label: 'Draft', color: 'warning' },
  2: { label: 'Published', color: 'success' },
  3: { label: 'Archived', color: 'default' },
};

const PlanStatusChip = ({ status }: { status: PlanStatus }) => {
  const { label, color } = statuses[status];
  return <Chip label={label} color={color} />;
};

export default PlanStatusChip;
