import { AnalyticsAreaConfig } from 'types/analytics';

// Inquiries: reads the dataset inquiries.overview (backend/app/Services/V1/Admin/Analytics/definitions).
const inquiries: AnalyticsAreaConfig = {
  area: 'inquiries',
  title: 'Inquiries',
  icon: 'material-symbols:inbox-outline-rounded',
  description: 'How many inquiries arrive, how fast they are answered and how many become schools.',
  order: 60,
  primaryDataset: 'inquiries.overview',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'inquiries.overview',
          path: 'kpis.received',
          title: 'Inquiries received',
          icon: 'material-symbols:mail-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'inquiries.overview',
          path: 'kpis.openNow',
          title: 'Open now',
          icon: 'material-symbols:inbox-outline-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'inquiries.overview',
          path: 'kpis.unassigned',
          title: 'Waiting for someone',
          icon: 'material-symbols:hourglass-empty',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'inquiries.overview',
          path: 'kpis.conversion',
          title: 'Became a school',
          icon: 'material-symbols:school-outline',
        },
      ],
    },
    {
      title: 'Volume',
      widgets: [
        {
          type: 'area',
          dataset: 'inquiries.overview',
          path: 'series.volume',
          title: 'Inquiries over time',
          subtitle: 'Messages received in each period',
          span: 3,
        },
        {
          type: 'donut',
          dataset: 'inquiries.overview',
          path: 'breakdowns.bySource',
          title: 'Where they come from',
          subtitle: 'By form',
          span: 1,
        },
      ],
    },
    {
      title: 'Speed',
      widgets: [
        {
          type: 'kpi',
          dataset: 'inquiries.overview',
          path: 'kpis.firstResponse',
          title: 'First response',
          icon: 'material-symbols:timer-outline-rounded',
          goodWhen: 'down',
          span: 2,
        },
        {
          type: 'kpi',
          dataset: 'inquiries.overview',
          path: 'kpis.resolution',
          title: 'Time to resolve',
          icon: 'material-symbols:check-circle-outline-rounded',
          goodWhen: 'down',
          span: 2,
        },
      ],
    },
    {
      title: 'From message to school',
      widgets: [
        {
          type: 'bars',
          dataset: 'inquiries.overview',
          path: 'series.funnel',
          title: 'How inquiries move forward',
          subtitle:
            'Received, handled by staff, resolved and turned into a school (matched by email, approximate)',
          span: 3,
        },
        {
          type: 'donut',
          dataset: 'inquiries.overview',
          path: 'breakdowns.byStatus',
          title: 'Status of inquiries',
          subtitle: 'As they stand now',
          span: 1,
        },
      ],
    },
    {
      title: 'Who is working on them',
      widgets: [
        {
          type: 'bars',
          dataset: 'inquiries.overview',
          path: 'series.workload',
          title: 'Workload per staff member',
          subtitle: 'Open now and resolved in this period',
          span: 4,
        },
        {
          type: 'table',
          dataset: 'inquiries.overview',
          path: 'tables.assignees',
          title: 'Staff workload',
          subtitle: 'Received, open and resolved per person',
          span: 4,
          maxRows: 10,
        },
        {
          type: 'table',
          dataset: 'inquiries.overview',
          path: 'tables.oldestOpen',
          title: 'Oldest open inquiries',
          subtitle: 'Nobody-yet inquiries first, then the longest waiting',
          span: 4,
          maxRows: 10,
        },
      ],
    },
  ],
};

export default inquiries;
