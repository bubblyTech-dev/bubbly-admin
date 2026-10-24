import { PropsWithChildren } from 'react';
import { Drawer, drawerClasses } from '@mui/material';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import AppBar from 'layouts/main-layout/app-bar';
import Sidenav from 'layouts/main-layout/sidenav';
import { boxedContentWidth, mainDrawerWidth } from 'lib/constants';
import { useSettingsContext } from 'providers/SettingsProvider';
import NavProvider from './NavProvider';
import Footer from './footer';
import SidenavDrawerContent from './sidenav/SidenavDrawerContent';
import { topNavHeight } from './top-nav';

const MainLayout = ({ children }: PropsWithChildren) => {
  const {
    config: { drawerWidth, openNavbarDrawer, sidenavPosition, contentWidth, themePreset },
    setConfig,
  } = useSettingsContext();

  const isTop = sidenavPosition === 'top';
  const isRight = sidenavPosition === 'right';

  const toggleNavbarDrawer = () => {
    setConfig({
      openNavbarDrawer: !openNavbarDrawer,
    });
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isRight ? 'row-reverse' : 'row',
          zIndex: 1,
          position: 'relative',
        }}
      >
        <NavProvider>
          <AppBar />

          <Sidenav />

          <Drawer
            variant="temporary"
            open={openNavbarDrawer}
            onClose={toggleNavbarDrawer}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              [`& .${drawerClasses.paper}`]: {
                pt: 3,
                boxSizing: 'border-box',
                width: mainDrawerWidth.full,
              },
            }}
          >
            <SidenavDrawerContent variant="temporary" />
          </Drawer>

          <Box
            component="main"
            sx={[
              {
                flexGrow: 1,
                p: 0,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              },
              isTop
                ? { width: 1 }
                : {
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    ...(isRight
                      ? { mr: { md: `${mainDrawerWidth.collapsed}px`, lg: 0 } }
                      : { ml: { md: `${mainDrawerWidth.collapsed}px`, lg: 0 } }),
                  },
            ]}
          >
            <Toolbar variant="appbar" />
            {isTop && (
              <Toolbar sx={{ minHeight: topNavHeight, display: { xs: 'none', md: 'block' } }} />
            )}

            <Box sx={{ flex: 1 }}>
              <Box
                sx={[
                  {
                    height: 1,
                    bgcolor: 'background.default',
                  },
                ]}
              >
                {/* keyed so charts and canvases redraw with the new colours when the preset changes */}
                <Box
                  key={themePreset}
                  sx={{
                    height: 1,
                    width: 1,
                    mx: 'auto',
                    maxWidth: contentWidth === 'boxed' ? boxedContentWidth : 'none',
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
            <Footer />
          </Box>
        </NavProvider>
      </Box>
    </Box>
  );
};

export default MainLayout;
