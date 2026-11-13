import { AnalyticsAreaConfig } from 'types/analytics';

// Plans & modules: reads the dataset plans.overview (backend/app/Services/V1/Admin/Analytics/definitions).
const plansModules: AnalyticsAreaConfig = {
  area: 'plans-modules',
  title: 'Plans & modules',
  icon: 'material-symbols:sell-outline',
  description: 'Which plans schools choose, what they cost and which modules they include.',
  order: 70,
  primaryDataset: 'plans.overview',
  sections: [
    {
      widgets: [
        {
          type: 'kpi',
          dataset: 'plans.overview',
          path: 'kpis.publishedPlans',
          title: 'Published plans',
          icon: 'material-symbols:sell-outline',
        },
        {
          type: 'kpi',
          dataset: 'plans.overview',
          path: 'kpis.draftPlans',
          title: 'Draft plans',
          icon: 'material-symbols:widgets-outline-rounded',
        },
        {
          type: 'kpi',
          dataset: 'plans.overview',
          path: 'kpis.subscribers',
          title: 'Active subscribers',
          icon: 'material-symbols:group-outline',
        },
        {
          type: 'kpi',
          dataset: 'plans.overview',
          path: 'kpis.newSubscriptions',
          title: 'New subscriptions',
          icon: 'material-symbols:trending-up-rounded',
        },
      ],
    },
    {
      title: 'Popularity',
      widgets: [
        {
          type: 'bars',
          dataset: 'plans.overview',
          path: 'series.popularity',
          title: 'Active subscribers per plan',
          subtitle: 'Schools that are Active or Past due on each plan',
          span: 2,
        },
        {
          type: 'stacked',
          dataset: 'plans.overview',
          path: 'series.newByPlan',
          title: 'New subscriptions by plan',
          subtitle: 'Subscriptions that started in each period',
          span: 2,
        },
      ],
    },
    {
      title: 'Price and billing',
      widgets: [
        {
          type: 'bars',
          dataset: 'plans.overview',
          path: 'series.prices',
          title: 'Price per plan',
          subtitle: 'Without GST, per billing period',
          span: 2,
          format: 'money',
        },
        {
          type: 'donut',
          dataset: 'plans.overview',
          path: 'breakdowns.byInterval',
          title: 'Monthly, quarterly or yearly',
          subtitle: 'Active subscribers by billing period',
          span: 1,
        },
        {
          type: 'donut',
          dataset: 'plans.overview',
          path: 'breakdowns.byStatus',
          title: 'Plans by status',
          subtitle: 'Draft, published and archived',
          span: 1,
        },
      ],
    },
    {
      title: 'What plans include',
      widgets: [
        {
          type: 'bars',
          dataset: 'plans.overview',
          path: 'series.features',
          title: 'Features per plan',
          subtitle: 'The lines shown on the pricing page',
          span: 2,
        },
        {
          type: 'bars',
          dataset: 'plans.overview',
          path: 'series.modules',
          title: 'Module adoption',
          subtitle: 'Published plans that include each module, and schools using it',
          span: 2,
        },
      ],
    },
    {
      title: 'Plan versions',
      widgets: [
        {
          type: 'table',
          dataset: 'plans.overview',
          path: 'tables.versions',
          title: 'All plans and versions',
          subtitle: 'A new version is made when a published plan needs a new price',
          span: 4,
          maxRows: 10,
        },
      ],
    },
  ],
};

export default plansModules;
