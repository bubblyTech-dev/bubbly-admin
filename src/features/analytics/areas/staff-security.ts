import { AnalyticsAreaConfig } from 'types/analytics';

// Staff & security: reads the dataset security.overview (backend/app/Services/V1/Admin/Analytics/definitions).
const staffSecurity: AnalyticsAreaConfig = {
  area: 'staff-security',
  title: 'Staff & security',
  icon: 'material-symbols:security-rounded',
  description: 'Sign-ins, failed attempts, locked accounts, active sessions and what staff change.',
  order: 80,
  primaryDataset: 'security.overview',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'security.overview',
          path: 'kpis.logins',
          title: 'Successful sign-ins',
          icon: 'material-symbols:login-rounded',
        },
        {
          type: 'kpi',
          dataset: 'security.overview',
          path: 'kpis.failedLogins',
          title: 'Failed sign-ins',
          icon: 'material-symbols:error-outline-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'security.overview',
          path: 'kpis.locked',
          title: 'Locked accounts',
          icon: 'material-symbols:lock-outline',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'security.overview',
          path: 'kpis.sessions',
          title: 'Active sessions',
          icon: 'material-symbols:monitor-outline-rounded',
        },
      ],
    },
    {
      title: 'Sign-ins',
      widgets: [
        {
          type: 'stacked',
          dataset: 'security.overview',
          path: 'series.logins',
          title: 'Sign-ins per period',
          subtitle: 'Successful and failed attempts',
          span: 3,
        },
        {
          type: 'donut',
          dataset: 'security.overview',
          path: 'breakdowns.failureReasons',
          title: 'Why sign-ins failed',
          subtitle: 'In this period',
          span: 1,
        },
      ],
    },
    {
      title: 'Failed attempts',
      widgets: [
        {
          type: 'table',
          dataset: 'security.overview',
          path: 'tables.hotspots',
          title: 'Failed-login hotspots',
          subtitle: 'Top 10 by attempts. Emails are partly hidden.',
          span: 4,
          maxRows: 10,
        },
      ],
    },
    {
      title: 'What staff do',
      widgets: [
        {
          type: 'kpi',
          dataset: 'security.overview',
          path: 'kpis.auditEvents',
          title: 'Audit events',
          icon: 'material-symbols:history-rounded',
          span: 2,
        },
        {
          type: 'kpi',
          dataset: 'security.overview',
          path: 'kpis.sensitive',
          title: 'Sensitive actions',
          icon: 'material-symbols:shield-outline',
          goodWhen: 'down',
          span: 2,
        },
        {
          type: 'stacked',
          dataset: 'security.overview',
          path: 'series.auditByAction',
          title: 'Actions over time',
          subtitle: 'The busiest kinds of action, the rest together',
          span: 3,
        },
        {
          type: 'donut',
          dataset: 'security.overview',
          path: 'breakdowns.auditByArea',
          title: 'Where the changes happen',
          subtitle: 'By area of the app',
          span: 1,
        },
        {
          type: 'bars',
          dataset: 'security.overview',
          path: 'series.sensitive',
          title: 'Sensitive actions over time',
          subtitle: 'Refunds, permission and status changes, deletions and settings',
          span: 4,
        },
      ],
    },
    {
      title: 'Who and what',
      widgets: [
        {
          type: 'table',
          dataset: 'security.overview',
          path: 'tables.actors',
          title: 'Most active',
          subtitle: 'Top 10 people by actions',
          span: 4,
          maxRows: 10,
        },
        {
          type: 'table',
          dataset: 'security.overview',
          path: 'tables.sensitive',
          title: 'Sensitive actions',
          subtitle: 'Latest first. Master admin actions are only visible to the master admin.',
          span: 4,
          maxRows: 10,
        },
        {
          type: 'donut',
          dataset: 'security.overview',
          path: 'breakdowns.staffByType',
          title: 'Staff by type',
          subtitle: 'Master and staff accounts',
          span: 2,
        },
        {
          type: 'donut',
          dataset: 'security.overview',
          path: 'breakdowns.staffByStatus',
          title: 'Staff by status',
          subtitle: 'Active, inactive and locked',
          span: 2,
        },
      ],
    },
  ],
};

export default staffSecurity;
