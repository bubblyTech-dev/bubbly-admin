import { AnalyticsAreaConfig } from 'types/analytics';

// Analytics > Payments health. Rules are at the top of
// backend/app/Services/V1/Admin/Analytics/definitions/payments.health.js.
const paymentsHealth: AnalyticsAreaConfig = {
  area: 'payments-health',
  title: 'Payments health',
  icon: 'material-symbols:check-circle-outline-rounded',
  description:
    'Do payments go through, why do they fail, how much is refunded, and how schools pay.',
  order: 40,
  primaryDataset: 'payments.health',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'payments.health',
          path: 'kpis.successRate',
          title: 'Success rate',
          icon: 'material-symbols:check-circle-rounded',
        },
        {
          type: 'kpi',
          dataset: 'payments.health',
          path: 'kpis.attempts',
          title: 'Payment attempts',
          icon: 'material-symbols:credit-card-outline',
        },
        {
          type: 'kpi',
          dataset: 'payments.health',
          path: 'kpis.collected',
          title: 'Collected',
          icon: 'material-symbols:payments-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'payments.health',
          path: 'kpis.average',
          title: 'Average payment',
          icon: 'material-symbols:attach-money-rounded',
        },
        {
          type: 'kpi',
          dataset: 'payments.health',
          path: 'kpis.failed',
          title: 'Failed payments',
          icon: 'material-symbols:error-outline-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'payments.health',
          path: 'kpis.refundRate',
          title: 'Refund rate',
          icon: 'material-symbols:percent-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'payments.health',
          path: 'kpis.refunded',
          title: 'Refunded',
          icon: 'material-symbols:undo-rounded',
          goodWhen: 'down',
        },
      ],
    },
    {
      title: 'Do payments go through?',
      widgets: [
        {
          type: 'stacked',
          dataset: 'payments.health',
          path: 'series.outcomes',
          title: 'Payments by outcome',
          subtitle: 'Paid, refunded, failed and still in progress in each period',
          span: 2,
        },
        {
          type: 'line',
          dataset: 'payments.health',
          path: 'series.successRate',
          title: 'Success rate',
          subtitle: 'Paid payments out of paid and failed, in each period',
          format: 'percent',
          span: 2,
        },
      ],
    },
    {
      title: 'Why they fail',
      widgets: [
        {
          type: 'bars',
          dataset: 'payments.health',
          path: 'series.failures',
          title: 'Failed payments',
          subtitle: 'How many payments failed in each period',
          span: 2,
        },
        {
          type: 'donut',
          dataset: 'payments.health',
          path: 'breakdowns.failureReasons',
          title: 'Top failure reasons',
          subtitle: 'The reason the gateway gave',
          span: 2,
        },
      ],
    },
    {
      title: 'How schools pay',
      widgets: [
        {
          type: 'donut',
          dataset: 'payments.health',
          path: 'breakdowns.byMethod',
          title: 'Payment methods',
          subtitle: 'Successful payments by method',
          span: 2,
        },
        {
          type: 'donut',
          dataset: 'payments.health',
          path: 'breakdowns.bySource',
          title: 'Online or offline',
          subtitle: 'Successful payments by how they were made',
          span: 2,
        },
      ],
    },
    {
      title: 'Needs a look',
      widgets: [
        {
          type: 'table',
          dataset: 'payments.health',
          path: 'tables.recentFailed',
          title: 'Latest failed payments',
          subtitle: 'The most recent failures in this period',
          span: 4,
          maxRows: 10,
        },
      ],
    },
  ],
};

export default paymentsHealth;
