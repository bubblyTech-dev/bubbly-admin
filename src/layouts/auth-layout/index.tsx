import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Logo from 'components/common/Logo';
import LoginHero from 'components/illustrations/LoginHero';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <Grid
      container
      sx={{
        height: { md: '100vh' },
        minHeight: '100vh',
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
      }}
    >
      {/* left: full-height illustrated panel on desktop, just the logo on small screens */}
      <Grid
        size={{
          xs: 12,
          md: 7,
        }}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRight: { md: 1 },
          borderColor: { md: 'divider' },
        }}
      >
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', p: 3, pb: 2 }}>
          <Logo />
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', inset: 0 }}>
          <LoginHero />
        </Box>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: 32,
            left: { md: 48, lg: 64 },
            zIndex: 2,
          }}
        >
          <Logo />
        </Box>
      </Grid>

      <Grid
        size={{
          md: 5,
          xs: 12,
        }}
        sx={{
          display: { xs: 'flex', md: 'block' },
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {children}
      </Grid>
    </Grid>
  );
};

export default AuthLayout;
