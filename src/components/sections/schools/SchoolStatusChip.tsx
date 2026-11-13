import Chip from '@mui/material/Chip';
import { SchoolStatus } from 'types/school';
import { schoolStatusColor, schoolStatusLabel } from './schoolStatus';

const SchoolStatusChip = ({ status }: { status: SchoolStatus }) => {
  return <Chip size="small" label={schoolStatusLabel[status]} color={schoolStatusColor[status]} />;
};

export default SchoolStatusChip;
