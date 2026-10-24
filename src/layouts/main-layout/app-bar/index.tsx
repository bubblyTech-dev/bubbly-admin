import { Box, Button, Stack, paperClasses } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'components/common/Logo';
import AppbarActionItems from '../common/AppbarActionItems';
import SearchBox, { SearchBoxButton } from '../common/search-box/SearchBox';
import TopNav from '../top-nav';

const AppBar = () => {
  const {
    config: { drawerWidth, sidenavPosition },
    handleDrawerToggle,
  } = useSettingsContext();

  const { up } = useBreakpoints();
  const upSm = up('sm');
  const upMd = up('md');
  const isTop = sidenavPosition === 'top';
  const isRight = sidenavPosition === 'right';

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        ...(isTop
          ? { width: 1 }
          : {
              width: { md: `calc(100% - ${drawerWidth}px)` },
              ...(isRight
                ? { mr: { md: `${drawerWidth}px` } }
                : { ml: { md: `${drawerWidth}px` } }),
            }),
        borderBottom: `1px solid`,
        borderColor: 'divider',
        [`&.${paperClasses.root}`]: {
          outline: 'none',
        },
      }}
    >
      <Toolbar variant="appbar" sx={{ px: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1,
            pr: 2,
          }}
        >
          <Button
            color="neutral"
            variant="soft"
            shape="circle"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
          >
            <IconifyIcon icon="material-symbols:menu-rounded" sx={{ fontSize: 20 }} />
          </Button>

          <Box>
            <Logo showName={upSm} />
          </Box>
        </Box>

        {isTop && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', pr: 4 }}>
            <Logo showName />
          </Box>
        )}

        <Stack
          sx={{
            alignItems: 'center',
            flex: 1,
          }}
        >
          {upMd ? (
            <SearchBox
              sx={{
                width: 1,
                maxWidth: 420,
              }}
            />
          ) : (
            <SearchBoxButton />
          )}
          <AppbarActionItems />
        </Stack>
      </Toolbar>
      {isTop && upMd && <TopNav />}
    </MuiAppBar>
  );
};

export default AppBar;
