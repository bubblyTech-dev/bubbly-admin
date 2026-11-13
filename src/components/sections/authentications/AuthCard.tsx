import { PropsWithChildren, ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

// The shared frame of every auth page (login, forgot, reset, change password).
const AuthCard = ({ title, subtitle, footer, children }: PropsWithChildren<AuthCardProps>) => (
  <Stack
    direction="column"
    sx={{
      height: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      pt: { md: 10 },
      pb: 10,
    }}
  >
    <div />

    <Grid container sx={{ maxWidth: '35rem', width: 1, rowGap: 4, p: { xs: 3, sm: 5 }, mb: 5 }}>
      <Grid size={12}>
        <Typography variant="h4" sx={{ mb: subtitle ? 1 : 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Grid>
      <Grid size={12}>{children}</Grid>
    </Grid>

    <div>{footer}</div>
  </Stack>
);

export default AuthCard;
