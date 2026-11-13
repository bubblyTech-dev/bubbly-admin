import { AnalyticsAreaConfig } from 'types/analytics';

// System health: reads the dataset system.health (backend/app/Services/V1/Admin/Analytics/definitions).
const systemHealth: AnalyticsAreaConfig = {
  area: 'system-health',
  title: 'System health',
  icon: 'material-symbols:cloud',
  description:
    'Whether payment notifications arrive and are processed, and what the background job did.',
  order: 90,
  primaryDataset: 'system.health',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'system.health',
          path: 'kpis.events',
          title: 'Received',
          icon: 'material-symbols:notifications-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'system.health',
          path: 'kpis.failureRate',
          title: 'Failure rate',
          icon: 'material-symbols:error-outline-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'system.health',
          path: 'kpis.waiting',
          title: 'Needs attention',
          icon: 'material-symbols:hourglass-empty',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'system.health',
          path: 'kpis.processing',
          title: 'Processing (ms)',
          icon: 'material-symbols:timer-outline-rounded',
          goodWhen: 'down',
        },
      ],
    },
    {
      title: 'Payment notifications',
      widgets: [
        {
          type: 'stacked',
          dataset: 'system.health',
          path: 'series.events',
          title: 'Notifications per period',
          subtitle: 'Processed, ignored, failed and still waiting',
          span: 3,
        },
        {
          type: 'donut',
          dataset: 'system.health',
          path: 'breakdowns.byStatus',
          title: 'By status',
          subtitle: 'In this period',
          span: 1,
        },
      ],
    },
    {
      title: 'Speed and retries',
      widgets: [
        {
          type: 'line',
          dataset: 'system.health',
          path: 'series.processing',
          title: 'Average processing time',
          subtitle: 'Milliseconds from arriving to done',
          span: 2,
        },
        {
          type: 'bars',
          dataset: 'system.health',
          path: 'series.attempts',
          title: 'Attempts per notification',
          subtitle: 'Most should need one',
          span: 2,
        },
      ],
    },
    {
      title: 'What arrives',
      widgets: [
        {
          type: 'donut',
          dataset: 'system.health',
          path: 'breakdowns.byType',
          title: 'By type',
          subtitle: 'The most common notifications',
          span: 1,
        },
        {
          type: 'table',
          dataset: 'system.health',
          path: 'tables.lastPerType',
          title: 'Last notification per type',
          subtitle: 'When each type last arrived',
          span: 4,
          maxRows: 10,
        },
      ],
    },
    {
      title: 'Needs attention',
      widgets: [
        {
          type: 'table',
          dataset: 'system.health',
          path: 'tables.attention',
          title: 'Failed or stuck notifications',
          subtitle: 'Open Billing, Webhook events to process them again',
          span: 4,
          maxRows: 10,
        },
      ],
    },
    {
      title: 'Background job (offline schools)',
      widgets: [
        {
          type: 'kpi',
          dataset: 'system.health',
          path: 'kpis.retried',
          title: 'Needed a retry',
          icon: 'material-symbols:refresh-rounded',
          goodWhen: 'down',
          span: 2,
        },
        {
          type: 'kpi',
          dataset: 'system.health',
          path: 'kpis.jobMoves',
          title: 'Moved by the job',
          icon: 'material-symbols:schedule-outline-rounded',
          span: 2,
        },
        {
          type: 'stacked',
          dataset: 'system.health',
          path: 'series.expiryJob',
          title: 'What the job changed',
          subtitle: 'Past due, suspended, expired and cancelled',
          span: 3,
        },
        {
          type: 'donut',
          dataset: 'system.health',
          path: 'breakdowns.jobByAction',
          title: 'By change',
          subtitle: 'In this period',
          span: 1,
        },
      ],
    },
  ],
};

export default systemHealth;
