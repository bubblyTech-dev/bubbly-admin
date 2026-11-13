import { AnalyticsAreaConfig } from 'types/analytics';

// Analytics > Revenue. Revenue is shown WITHOUT GST; GST has its own card and chart.
// Rules (including how monthly recurring revenue is estimated) are at the top of
// backend/app/Services/V1/Admin/Analytics/definitions/revenue.overview.js.
const revenue: AnalyticsAreaConfig = {
  area: 'revenue',
  title: 'Revenue',
  icon: 'material-symbols:payments-outline-rounded',
  description:
    'What came in without GST, how it splits by plan and payment method, and how monthly recurring revenue is moving.',
  order: 30,
  primaryDataset: 'revenue.overview',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'revenue.overview',
          path: 'kpis.revenue',
          title: 'Revenue (without GST)',
          icon: 'material-symbols:payments-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'revenue.overview',
          path: 'kpis.mrr',
          title: 'Monthly recurring',
          icon: 'material-symbols:query-stats-rounded',
        },
        {
          type: 'kpi',
          dataset: 'revenue.overview',
          path: 'kpis.arr',
          title: 'Yearly recurring',
          icon: 'material-symbols:trending-up-rounded',
        },
        {
          type: 'kpi',
          dataset: 'revenue.overview',
          path: 'kpis.gst',
          title: 'GST collected',
          icon: 'material-symbols:percent-rounded',
        },
        {
          type: 'kpi',
          dataset: 'revenue.overview',
          path: 'kpis.payingSchools',
          title: 'Paying schools',
          icon: 'material-symbols:school-outline',
        },
        {
          type: 'kpi',
          dataset: 'revenue.overview',
          path: 'kpis.averageRevenue',
          title: 'Average per school',
          icon: 'material-symbols:attach-money-rounded',
        },
        {
          type: 'kpi',
          dataset: 'revenue.overview',
          path: 'kpis.refunds',
          title: 'Refunded',
          icon: 'material-symbols:undo-rounded',
          goodWhen: 'down',
        },
      ],
    },
    {
      title: 'Money coming in',
      widgets: [
        {
          type: 'line',
          dataset: 'revenue.overview',
          path: 'series.revenueTrend',
          title: 'Revenue',
          subtitle: 'Without GST, in each period (switch on Compare to see the previous period)',
          format: 'money',
          span: 4,
        },
        {
          type: 'area',
          dataset: 'revenue.overview',
          path: 'series.mrrTrend',
          title: 'Monthly recurring revenue',
          subtitle: 'Estimated at the end of each period',
          format: 'money',
          span: 2,
        },
        {
          type: 'stacked',
          dataset: 'revenue.overview',
          path: 'series.gstSplit',
          title: 'Revenue and GST',
          subtitle: 'What the schools paid, split into your revenue and the GST',
          format: 'money',
          span: 2,
        },
      ],
    },
    {
      title: 'Where it comes from',
      widgets: [
        {
          type: 'bars',
          dataset: 'revenue.overview',
          path: 'series.byPlan',
          title: 'Revenue by plan',
          subtitle: 'Without GST',
          format: 'money',
          span: 2,
        },
        {
          type: 'donut',
          dataset: 'revenue.overview',
          path: 'breakdowns.byMethod',
          title: 'Revenue by payment method',
          subtitle: 'UPI, card, net banking or offline',
          format: 'money',
          span: 2,
        },
      ],
    },
    {
      title: 'Money going back',
      widgets: [
        {
          type: 'bars',
          dataset: 'revenue.overview',
          path: 'series.refundsTrend',
          title: 'Refunds',
          subtitle: 'What was given back to schools (includes GST)',
          format: 'money',
          span: 4,
        },
      ],
    },
    {
      title: 'Who pays the most',
      widgets: [
        {
          type: 'table',
          dataset: 'revenue.overview',
          path: 'tables.topPayers',
          title: 'Top paying schools',
          subtitle: 'In this period, without GST',
          span: 4,
          maxRows: 10,
        },
      ],
    },
  ],
};

export default revenue;
