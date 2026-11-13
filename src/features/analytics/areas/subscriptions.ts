import { AnalyticsAreaConfig } from 'types/analytics';

// Analytics > Subscriptions. Rules are written at the top of
// backend/app/Services/V1/Admin/Analytics/definitions/subscriptions.overview.js.
const subscriptions: AnalyticsAreaConfig = {
  area: 'subscriptions',
  title: 'Subscriptions',
  icon: 'material-symbols:credit-score-outline-rounded',
  description:
    'How many schools are subscribed, who joined or left, and how subscriptions split by plan and billing period.',
  order: 20,
  primaryDataset: 'subscriptions.overview',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'subscriptions.overview',
          path: 'kpis.active',
          title: 'Active subscriptions',
          icon: 'material-symbols:check-circle-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'subscriptions.overview',
          path: 'kpis.new',
          title: 'New subscriptions',
          icon: 'material-symbols:trending-up-rounded',
        },
        {
          type: 'kpi',
          dataset: 'subscriptions.overview',
          path: 'kpis.netChange',
          title: 'Net change',
          icon: 'material-symbols:trending-flat-rounded',
        },
        {
          type: 'kpi',
          dataset: 'subscriptions.overview',
          path: 'kpis.endingSoon',
          title: 'Ending in 30 days',
          icon: 'material-symbols:calendar-clock-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'subscriptions.overview',
          path: 'kpis.cancelled',
          title: 'Cancelled',
          icon: 'material-symbols:cancel-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'subscriptions.overview',
          path: 'kpis.expired',
          title: 'Expired',
          icon: 'material-symbols:hourglass-empty',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'subscriptions.overview',
          path: 'kpis.averageAge',
          title: 'Average age of active',
          icon: 'material-symbols:schedule-outline-rounded',
        },
      ],
    },
    {
      title: 'Joining and leaving',
      widgets: [
        {
          type: 'stacked',
          dataset: 'subscriptions.overview',
          path: 'series.lifecycle',
          title: 'New, cancelled and expired',
          subtitle: 'What happened to subscriptions in each period',
          span: 2,
        },
        {
          type: 'bars',
          dataset: 'subscriptions.overview',
          path: 'series.netChange',
          title: 'Net change',
          subtitle: 'New minus cancelled minus expired',
          span: 2,
        },
      ],
    },
    {
      title: 'How they split',
      widgets: [
        {
          type: 'bars',
          dataset: 'subscriptions.overview',
          path: 'series.activeByPlan',
          title: 'Active subscriptions by plan',
          subtitle: 'Which plans schools are on today',
          span: 2,
        },
        {
          type: 'donut',
          dataset: 'subscriptions.overview',
          path: 'breakdowns.byStatus',
          title: 'Subscriptions by status',
          subtitle: 'Every subscription, as it stands now',
          span: 2,
        },
        {
          type: 'donut',
          dataset: 'subscriptions.overview',
          path: 'breakdowns.byInterval',
          title: 'Monthly, quarterly or yearly',
          subtitle: 'Running subscriptions by billing period',
          span: 2,
        },
        {
          type: 'donut',
          dataset: 'subscriptions.overview',
          path: 'breakdowns.bySource',
          title: 'Online or offline',
          subtitle: 'How running subscriptions are paid',
          span: 2,
        },
      ],
    },
    {
      title: 'Coming up',
      widgets: [
        {
          type: 'table',
          dataset: 'subscriptions.overview',
          path: 'tables.endingSoon',
          title: 'Ending in the next 30 days',
          subtitle: 'Active subscriptions whose current period is about to end',
          span: 4,
          maxRows: 10,
        },
      ],
    },
  ],
};

export default subscriptions;
