import { AuthUser } from 'types/auth';
import paths from './paths';
import sitemap, { SubMenuItem, filterByPermission } from './sitemap';

const hasPermissionFor = (user: AuthUser) => (key: string) =>
  user.isMaster || user.permissions.includes(key);

// the first menu item with a real address
const firstPath = (items: SubMenuItem[]): string | null => {
  for (const item of items) {
    if (item.path && item.path !== '#!') return item.path;
    const nested = item.items ? firstPath(item.items) : null;
    if (nested) return nested;
  }
  return null;
};

// Where an admin lands after logging in: the Dashboard, or when they may not open it, the first page in their
// sidebar. Never a page they cannot open (their own account is the last resort).
export const landingPath = (user: AuthUser): string => {
  const hasPermission = hasPermissionFor(user);
  if (hasPermission('dashboard.view')) return paths.root;

  const visible = filterByPermission(
    sitemap.flatMap((menu) => menu.items),
    hasPermission,
  );
  return firstPath(visible) ?? paths.account;
};
