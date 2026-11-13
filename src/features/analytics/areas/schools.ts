import { AnalyticsAreaConfig } from 'types/analytics';

// Analytics > Schools. Every widget reads from backend/app/Services/V1/Admin/Analytics/definitions/schools.growth.js,
// where the rules behind each number are written down.
const schools: AnalyticsAreaConfig = {
  area: 'schools',
  title: 'Schools',
  icon: 'material-symbols:school-outline',
  description:
    'How many schools joined, how the base grew, where they are, and how sign-ups turn into paying schools.',
  order: 10,
  primaryDataset: 'schools.growth',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'schools.growth',
          path: 'kpis.totalSchools',
          title: 'Total schools',
          icon: 'material-symbols:school-outline',
        },
        {
          type: 'kpi',
          dataset: 'schools.growth',
          path: 'kpis.newSchools',
          title: 'New schools',
          icon: 'material-symbols:trending-up-rounded',
        },
        {
          type: 'kpi',
          dataset: 'schools.growth',
          path: 'kpis.activeSchools',
          title: 'Active now',
          icon: 'material-symbols:check-circle-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'schools.growth',
          path: 'kpis.daysToActivate',
          title: 'Days to activate',
          icon: 'material-symbols:timer-outline-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'schools.growth',
          path: 'kpis.suspendedSchools',
          title: 'Suspended now',
          icon: 'material-symbols:pause-circle-rounded',
          goodWhen: 'down',
        },
        {
          type: 'kpi',
          dataset: 'schools.growth',
          path: 'kpis.archivedSchools',
          title: 'Archived now',
          icon: 'material-symbols:history-rounded',
          goodWhen: 'down',
        },
      ],
    },
    {
      title: 'Growth',
      widgets: [
        {
          type: 'bars',
          dataset: 'schools.growth',
          path: 'series.newSchools',
          title: 'New schools',
          subtitle: 'How many schools joined in each period',
          span: 2,
        },
        {
          type: 'area',
          dataset: 'schools.growth',
          path: 'series.totalSchools',
          title: 'Total schools',
          subtitle: 'The running total of schools',
          span: 2,
        },
      ],
    },
    {
      title: 'From sign-up to paying school',
      widgets: [
        {
          type: 'bars',
          dataset: 'schools.growth',
          path: 'series.funnel',
          title: 'Sign-up funnel',
          subtitle: 'Of the schools that joined: with a subscription, active, and paid',
          span: 2,
        },
        {
          type: 'stacked',
          dataset: 'schools.growth',
          path: 'series.statusChanges',
          title: 'Suspensions, archives and reactivations',
          subtitle: 'Schools whose status was changed by your team',
          span: 2,
        },
      ],
    },
    {
      title: 'Who they are',
      widgets: [
        {
          type: 'donut',
          dataset: 'schools.growth',
          path: 'breakdowns.byStatus',
          title: 'Schools by status',
          subtitle: 'As of the end of the period',
          span: 2,
        },
        {
          type: 'bars',
          dataset: 'schools.growth',
          path: 'series.byPlan',
          title: 'Schools by plan',
          subtitle: 'Schools with a running subscription',
          span: 2,
        },
      ],
    },
    {
      title: 'Where they are',
      widgets: [
        {
          type: 'bars',
          dataset: 'schools.growth',
          path: 'series.byState',
          title: 'Top 6 states',
          subtitle: 'Schools per state',
          span: 2,
        },
        {
          type: 'table',
          dataset: 'schools.growth',
          path: 'tables.locations',
          title: 'States and cities',
          subtitle: 'Where your schools are, with how many are active and paying',
          span: 2,
          maxRows: 8,
        },
      ],
    },
    {
      title: 'Biggest schools',
      widgets: [
        {
          type: 'table',
          dataset: 'schools.growth',
          path: 'tables.topSchools',
          title: 'Top schools by plan value',
          subtitle: 'Monthly value of the active plan, without GST',
          span: 4,
          maxRows: 10,
        },
      ],
    },
  ],
};

export default schools;
