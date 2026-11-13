import { MouseEvent, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Box, Button, Menu, MenuItem, Toolbar } from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import sitemap, { SubMenuItem, filterByPermission } from 'routes/sitemap';
import IconifyIcon from 'components/base/IconifyIcon';

export const topNavHeight = 56;

const isItemActive = (item: SubMenuItem, pathname: string): boolean => {
  if (item.path && item.path !== '#!') {
    return item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
  }
  return !!item.items?.some((child) => isItemActive(child, pathname));
};

const TopNavLink = ({ item, active }: { item: SubMenuItem; active: boolean }) => (
  <Button
    component={NavLink}
    to={item.path ?? '#!'}
    color={active ? 'primary' : 'neutral'}
    variant={active ? 'soft' : 'text'}
    startIcon={item.icon ? <IconifyIcon icon={item.icon} sx={{ fontSize: 20 }} /> : undefined}
    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
  >
    {item.name}
  </Button>
);

const TopNavMenu = ({ item, active }: { item: SubMenuItem; active: boolean }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const renderItems = (items: SubMenuItem[], depth: number): React.ReactNode[] =>
    items
      .filter((child) => child.active !== false)
      .flatMap((child) => {
        const row = (
          <MenuItem
            key={`${child.pathName}-${depth}`}
            component={child.items ? 'div' : NavLink}
            {...(child.items ? {} : { to: child.path ?? '#!' })}
            onClick={child.items ? undefined : () => setAnchorEl(null)}
            sx={{ minWidth: 200, pl: 2 + depth * 2, ...(child.items && { fontWeight: 600 }) }}
          >
            {child.name}
          </MenuItem>
        );
        return child.items ? [row, ...renderItems(child.items, depth + 1)] : [row];
      });

  return (
    <>
      <Button
        color={active ? 'primary' : 'neutral'}
        variant={active ? 'soft' : 'text'}
        startIcon={item.icon ? <IconifyIcon icon={item.icon} sx={{ fontSize: 20 }} /> : undefined}
        endIcon={<IconifyIcon icon="material-symbols:expand-more-rounded" sx={{ fontSize: 18 }} />}
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        {item.name}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        {renderItems(item.items ?? [], 0)}
      </Menu>
    </>
  );
};

const TopNav = () => {
  const { pathname } = useLocation();
  const { hasPermission } = useAuth();
  const topItems = sitemap.flatMap((menu) =>
    filterByPermission(menu.items, hasPermission).filter((item) => item.active !== false),
  );

  return (
    <Toolbar
      sx={{
        minHeight: `${topNavHeight}px !important`,
        px: { md: 5 },
        gap: 0.5,
        borderTop: 1,
        borderColor: 'divider',
        overflowX: 'auto',
      }}
    >
      <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {topItems.map((item) => {
          const active = isItemActive(item, pathname);
          return item.items ? (
            <TopNavMenu key={item.pathName} item={item} active={active} />
          ) : (
            <TopNavLink key={item.pathName} item={item} active={active} />
          );
        })}
      </Box>
    </Toolbar>
  );
};

export default TopNav;
