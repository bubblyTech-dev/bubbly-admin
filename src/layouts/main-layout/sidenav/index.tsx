import { Backdrop, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import SidenavCollapse from './SidenavCollapse';
import SidenavDrawerContent from './SidenavDrawerContent';

const Sidenav = () => {
  const {
    config: { sidenavCollapsed, drawerWidth, sidenavPosition },
    toggleNavbarCollapse,
  } = useSettingsContext();
  const { currentBreakpoint } = useBreakpoints();

  const theme = useTheme();

  // the "top" layout shows a horizontal navigation bar instead (see top-nav)
  if (sidenavPosition === 'top') return null;

  const isRight = sidenavPosition === 'right';

  return (
    <Box
      component="nav"
      className="default-sidenav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { sm: 0 },
        transition: {
          xs: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.standard,
          }),
          lg: 'none',
        },
        position: { md: 'absolute', lg: 'static' },
      }}
    >
      <Drawer
        variant="permanent"
        anchor={isRight ? 'right' : 'left'}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          [`& .${drawerClasses.paper}`]: {
            overflow: 'visible',
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 0,
            ...(isRight ? { borderLeft: 1 } : { borderRight: 1 }),
            borderColor: 'divider',
            transition: {
              xs: theme.transitions.create(['width'], {
                duration: theme.transitions.duration.standard,
              }),
              lg: 'none',
            },
          },
        }}
        open
      >
        <SidenavDrawerContent />
        <SidenavCollapse />
      </Drawer>
      {currentBreakpoint === 'md' && (
        <Backdrop open={!sidenavCollapsed} sx={{ zIndex: 1199 }} onClick={toggleNavbarCollapse} />
      )}
    </Box>
  );
};

export default Sidenav;
