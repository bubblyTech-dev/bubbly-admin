import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { formatDateTime } from 'lib/format';
import { StaffUser } from 'types/staff';
import StaffStatusChip from '../StaffStatusChip';

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 3 }}>
    <Typography variant="subtitle2" sx={{ width: { sm: 200 }, flexShrink: 0 }}>
      {label}
    </Typography>
    <Box sx={{ color: 'text.secondary' }}>{children}</Box>
  </Stack>
);

const StaffDetailsTab = ({ staff }: { staff: StaffUser }) => (
  <Stack direction="column" spacing={2.5}>
    <Row label="Name">{staff.name || '-'}</Row>
    <Row label="Email">{staff.email}</Row>
    <Row label="Phone">{staff.phone || '-'}</Row>
    <Row label="Status">
      <StaffStatusChip status={staff.status} />
    </Row>
    {staff.lockedUntil && new Date(staff.lockedUntil) > new Date() && (
      <Row label="Locked until">{formatDateTime(staff.lockedUntil)}</Row>
    )}
    <Row label="Must change password">
      {staff.mustChangePassword ? 'Yes, at the next login' : 'No'}
    </Row>
    <Row label="Last login">{formatDateTime(staff.lastLoginAt)}</Row>
    <Row label="Added">{formatDateTime(staff.createdAt)}</Row>
  </Stack>
);

export default StaffDetailsTab;
