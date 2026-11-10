import { HTMLAttributeAnchorTarget } from 'react';
import { SxProps } from '@mui/material';
import paths, { rootPaths } from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string;
  target?: HTMLAttributeAnchorTarget;
  active?: boolean;
  /** permission key an admin needs to see this item (the master always sees it) */
  permission?: string;
  badge?: 'inquiries'; // small counter shown next to the name
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: string;
  key?: string; // used for the locale
  subheader?: string;
  icon: string;
  target?: HTMLAttributeAnchorTarget;
  iconSx?: SxProps;
  items: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 'pages',
    icon: 'material-symbols:view-quilt-outline',
    items: [
      {
        name: 'Dashboard',
        path: rootPaths.root,
        pathName: 'dashboard',
        icon: 'material-symbols:query-stats-rounded',
        active: true,
      },
      {
        name: 'Management',
        pathName: 'management',
        icon: 'material-symbols:folder-outline-rounded',
        active: true,
        items: [
          {
            name: 'Schools',
            path: paths.schools,
            pathName: 'schools',
            icon: 'material-symbols:school-outline',
            permission: 'schools.view',
            active: true,
          },
          {
            name: 'Plans',
            path: paths.plans,
            pathName: 'plans',
            icon: 'material-symbols:sell-outline',
            permission: 'plans.view',
            active: true,
          },
          {
            name: 'Modules',
            path: paths.modules,
            pathName: 'modules',
            icon: 'material-symbols:widgets-outline-rounded',
            permission: 'modules.view',
            active: true,
          },
          {
            name: 'Inquiries',
            path: paths.inquiries,
            pathName: 'inquiries',
            icon: 'material-symbols:inbox-outline-rounded',
            permission: 'inquiries.view',
            badge: 'inquiries',
            active: true,
          },
          {
            name: 'Announcements',
            path: paths.announcements,
            pathName: 'announcements',
            icon: 'material-symbols:event-note-outline-rounded',
            permission: 'announcements.view',
            active: true,
          },
        ],
      },
      {
        name: 'Billing',
        pathName: 'billing',
        icon: 'material-symbols:credit-card-outline',
        active: true,
        items: [
          {
            name: 'Subscriptions',
            path: paths.subscriptions,
            pathName: 'subscriptions',
            icon: 'material-symbols:payments-outline-rounded',
            permission: 'subscriptions.view',
            active: true,
          },
          {
            name: 'Payments',
            path: paths.payments,
            pathName: 'payments',
            icon: 'material-symbols:credit-score-outline-rounded',
            permission: 'billing.view',
            active: true,
          },
          {
            name: 'Invoices',
            path: paths.invoices,
            pathName: 'invoices',
            icon: 'material-symbols:description-outline-rounded',
            permission: 'billing.view',
            active: true,
          },
          {
            name: 'Webhook events',
            path: paths.webhookEvents,
            pathName: 'webhook-events',
            icon: 'material-symbols:swap-vertical-circle-outline-rounded',
            permission: 'billing.view',
            active: true,
          },
        ],
      },
      {
        name: 'Settings',
        pathName: 'settings-group',
        icon: 'material-symbols:settings-outline-rounded',
        active: true,
        items: [
          {
            name: 'User & Access',
            path: paths.users,
            pathName: 'users',
            icon: 'material-symbols:manage-accounts-outline-rounded',
            permission: 'users_access.view',
            active: true,
          },
          {
            name: 'Platform Settings',
            path: paths.settings,
            pathName: 'settings',
            icon: 'material-symbols:settings-outline-rounded',
            permission: 'settings.view',
            active: true,
          },
          {
            name: 'Audit Log',
            path: paths.auditLogs,
            pathName: 'audit-logs',
            icon: 'material-symbols:history-rounded',
            permission: 'audit.view',
            active: true,
          },
        ],
      },
      {
        name: 'Others',
        pathName: 'others',
        icon: 'material-symbols:view-quilt-outline',
        active: true,
        items: [
          {
            name: 'Starter',
            path: paths.starter,
            pathName: 'starter',
            icon: 'material-symbols:play-circle-outline-rounded',
            active: true,
          },
          {
            name: 'Error 404',
            pathName: 'error',
            active: true,
            icon: 'material-symbols:warning-outline-rounded',
            path: paths[404],
          },
          {
            name: 'Multi level',
            pathName: 'multi-level',
            icon: 'material-symbols:layers-outline-rounded',
            active: true,
            items: [
              {
                name: 'Level two (1)',
                path: '#!',
                pathName: 'multi-level-2',
                active: true,
              },
              {
                name: 'Level two (2)',
                pathName: 'multi-level-3',
                active: true,
                items: [
                  {
                    name: 'Level three (1)',
                    path: '#!',
                    pathName: 'multi-level-item-3',
                    active: true,
                  },
                  {
                    name: 'Level three (2)',
                    path: '#!',
                    pathName: 'multi-level-item-4',
                    active: true,
                  },
                ],
              },
              {
                name: 'Level two (3)',
                pathName: 'multi-level-4',
                active: true,
                items: [
                  {
                    name: 'Level three (3)',
                    path: '#!',
                    pathName: 'multi-level-item-6',
                    active: true,
                  },
                  {
                    name: 'Level three (4)',
                    pathName: 'multi-level-item-7',
                    active: true,
                    items: [
                      {
                        name: 'Level four (1)',
                        path: '#!',
                        pathName: 'multi-level-item-8',
                        active: true,
                      },
                      {
                        name: 'Level four (2)',
                        pathName: 'multi-level-item-9',
                        active: true,
                        items: [
                          {
                            name: 'Level five (1)',
                            path: '#!',
                            pathName: 'multi-level-item-10',
                            active: true,
                          },
                          {
                            name: 'Level five (2)',
                            path: '#!',
                            pathName: 'multi-level-item-11',
                            active: true,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

// the items an admin may see (children are filtered too)
export const filterByPermission = (
  items: SubMenuItem[],
  hasPermission: (key: string) => boolean,
): SubMenuItem[] =>
  items
    .filter((item) => !item.permission || hasPermission(item.permission))
    .map((item) =>
      item.items ? { ...item, items: filterByPermission(item.items, hasPermission) } : item,
    )
    // a group with nothing left to show is hidden as well
    .filter((item) => !item.items || item.items.length > 0);

export default sitemap;
