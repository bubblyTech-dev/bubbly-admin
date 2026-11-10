import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

// A small label above a value, used in the detail dialogs.
const DetailField = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Box sx={{ wordBreak: 'break-word' }}>{children}</Box>
  </Box>
);

export default DetailField;
