import { AnalyticsAreaConfig } from 'types/analytics';

// Renewals & churn: reads the dataset renewals.churn (backend/app/Services/V1/Admin/Analytics/definitions).
const renewalsChurn: AnalyticsAreaConfig = {
  area: 'renewals-churn',
  title: 'Renewals & churn',
  icon: 'material-symbols:refresh-rounded',
  description:
    'What renews soon, how renewals went, who left and how many failed payments came back.',
  order: 50,
  primaryDataset: 'renewals.churn',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'renewals.churn',
          path: 'kpis.dueIn30Days',
          title: 'Due in 30 days',
          icon: 'material-symbols:schedule-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'renewals.churn',
          path: 'kpis.expectedAmount',
          title: 'Expected in 30 days',
          icon: 'material-symbols:payments-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'renewals.churn',
          path: 'kpis.renewalRate',
          title: 'Renewal rate',
          icon: 'material-symbols:check-circle-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'renewals.churn',
          path: 'kpis.churnRate',
          title: 'Churn rate',
          icon: 'material-symbols:trending-down-rounded',
          goodWhen: 'down',
        },
      ],
    },
    {
      title: 'Coming up',
      widgets: [
        {
          type: 'bars',
          dataset: 'renewals.churn',
          path: 'series.dueNext30',
          title: 'Renewals due',
          subtitle: 'How many subscriptions renew on each of the next 30 days',
          span: 2,
        },
        {
          type: 'area',
          dataset: 'renewals.churn',
          path: 'series.dueAmount',
          title: 'Expected amount',
          subtitle: 'What those renewals should bring in, without GST',
          span: 2,
          format: 'money',
        },
      ],
    },
    {
      title: 'How renewals went',
      widgets: [
        {
          type: 'stacked',
          dataset: 'renewals.churn',
          path: 'series.outcomes',
          title: 'Paid and failed renewals',
          subtitle: 'Each bar splits into renewals that were paid and ones that failed',
          span: 2,
        },
        {
          type: 'bars',
          dataset: 'renewals.churn',
          path: 'series.ended',
          title: 'Subscriptions ended',
          subtitle: 'Cancelled or expired in each period',
          span: 2,
        },
      ],
    },
    {
      title: 'Who left and who came back',
      widgets: [
        {
          type: 'kpi',
          dataset: 'renewals.churn',
          path: 'kpis.ended',
          title: 'Subscriptions ended',
          icon: 'material-symbols:logout-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'renewals.churn',
          path: 'kpis.failedRenewals',
          title: 'Failed renewals',
          icon: 'material-symbols:error-outline-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'renewals.churn',
          path: 'kpis.recoveryRate',
          title: 'Past-due recovery',
          icon: 'material-symbols:refresh-rounded',
        },
        {
          type: 'kpi',
          dataset: 'renewals.churn',
          path: 'kpis.avgLifetime',
          title: 'Avg lifetime',
          icon: 'material-symbols:timer-outline-rounded',
        },
      ],
    },
    {
      title: 'After a payment fails',
      widgets: [
        {
          type: 'bars',
          dataset: 'renewals.churn',
          path: 'series.funnel',
          title: 'What happened to failed payments',
          subtitle: 'Of the subscriptions that went past due in this period',
          span: 2,
        },
        {
          type: 'bars',
          dataset: 'renewals.churn',
          path: 'series.lifetime',
          title: 'How long ended subscriptions lasted',
          subtitle: 'Time from start to end',
          span: 2,
        },
      ],
    },
    {
      title: 'Needs attention',
      widgets: [
        {
          type: 'table',
          dataset: 'renewals.churn',
          path: 'tables.atRisk',
          title: 'Schools at risk',
          subtitle:
            'Past due now, or renewing soon. Days left counts down the grace period for failed payments.',
          span: 4,
          maxRows: 10,
        },
      ],
    },
  ],
};

export default renewalsChurn;
