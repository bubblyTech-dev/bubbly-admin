import { AnalyticsAreaConfig } from 'types/analytics';

// Announcements: reads the dataset announcements.overview (backend/app/Services/V1/Admin/Analytics/definitions).
const announcements: AnalyticsAreaConfig = {
  area: 'announcements',
  title: 'Announcements',
  icon: 'material-symbols:event-note-outline-rounded',
  description: 'Notices sent to schools: what is live, what is coming and how they are used.',
  order: 100,
  primaryDataset: 'announcements.overview',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'announcements.overview',
          path: 'kpis.published',
          title: 'Published',
          icon: 'material-symbols:notifications-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'announcements.overview',
          path: 'kpis.live',
          title: 'Live now',
          icon: 'material-symbols:check-circle-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'announcements.overview',
          path: 'kpis.coming',
          title: 'Coming in 30 days',
          icon: 'material-symbols:schedule-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'announcements.overview',
          path: 'kpis.duration',
          title: 'Average time live',
          icon: 'material-symbols:timer-outline-rounded',
        },
      ],
    },
    {
      title: 'Activity',
      widgets: [
        {
          type: 'stacked',
          dataset: 'announcements.overview',
          path: 'series.published',
          title: 'Published per period',
          subtitle: 'Split by type',
          span: 3,
        },
        {
          type: 'donut',
          dataset: 'announcements.overview',
          path: 'breakdowns.byStatus',
          title: 'By status',
          subtitle: 'Announcements created in this period',
          span: 1,
        },
      ],
    },
    {
      title: 'Kinds',
      widgets: [
        {
          type: 'donut',
          dataset: 'announcements.overview',
          path: 'breakdowns.byType',
          title: 'By type',
          subtitle: 'Info, warning and maintenance',
          span: 2,
        },
        {
          type: 'donut',
          dataset: 'announcements.overview',
          path: 'breakdowns.byAudience',
          title: 'By audience',
          subtitle: 'All schools, selected schools or plans',
          span: 2,
        },
      ],
    },
    {
      title: 'Now and next',
      widgets: [
        {
          type: 'table',
          dataset: 'announcements.overview',
          path: 'tables.liveAndScheduled',
          title: 'Live and coming announcements',
          subtitle: 'Live first, then the ones starting in the next 30 days',
          span: 4,
          maxRows: 10,
        },
      ],
    },
  ],
};

export default announcements;
