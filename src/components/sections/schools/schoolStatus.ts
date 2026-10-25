import { ChipOwnProps } from '@mui/material/Chip';
import { SCHOOL_STATUS, SchoolStatus } from 'types/school';

export const schoolStatusLabel: Record<SchoolStatus, string> = {
  [SCHOOL_STATUS.ACTIVE]: 'Active',
  [SCHOOL_STATUS.SUSPENDED]: 'Suspended',
  [SCHOOL_STATUS.ARCHIVED]: 'Archived',
};

export const schoolStatusColor: Record<SchoolStatus, ChipOwnProps['color']> = {
  [SCHOOL_STATUS.ACTIVE]: 'success',
  [SCHOOL_STATUS.SUSPENDED]: 'warning',
  [SCHOOL_STATUS.ARCHIVED]: 'default',
};

// what a school in the given status can be changed to (mirrors the backend rules)
export const schoolStatusTargets: Record<SchoolStatus, SchoolStatus[]> = {
  [SCHOOL_STATUS.ACTIVE]: [SCHOOL_STATUS.SUSPENDED, SCHOOL_STATUS.ARCHIVED],
  [SCHOOL_STATUS.SUSPENDED]: [SCHOOL_STATUS.ACTIVE, SCHOOL_STATUS.ARCHIVED],
  [SCHOOL_STATUS.ARCHIVED]: [SCHOOL_STATUS.ACTIVE],
};

// the button or menu text for moving a school into a status
export const schoolStatusAction = (to: SchoolStatus) => {
  if (to === SCHOOL_STATUS.ACTIVE) return 'Reactivate';
  if (to === SCHOOL_STATUS.SUSPENDED) return 'Suspend';
  return 'Archive';
};
