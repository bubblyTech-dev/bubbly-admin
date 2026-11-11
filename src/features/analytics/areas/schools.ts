import { AnalyticsAreaConfig } from 'types/analytics';

// REFERENCE AREA CONFIG: copy this file to add an Analytics page. The file name does not matter; `area` is the address.
// The widgets read from the dataset in backend/app/Services/V1/Admin/Analytics/definitions/schools.growth.js.
const schools: AnalyticsAreaConfig = {
  area: 'schools',
  title: 'Schools',
  icon: 'material-symbols:school-outline',
  description: 'How many schools joined, how the total grew and where they stand.',
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
          title: 'Active schools now',
          icon: 'material-symbols:event-available-outline',
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
          subtitle: 'Schools that joined in each period',
          span: 2,
        },
        {
          type: 'area',
          dataset: 'schools.growth',
          path: 'series.totalSchools',
          title: 'Total schools',
          subtitle: 'The running total',
          span: 2,
        },
      ],
    },
    {
      title: 'Where they stand',
      widgets: [
        {
          type: 'donut',
          dataset: 'schools.growth',
          path: 'breakdowns.byStatus',
          title: 'Schools by status',
          span: 1,
        },
        {
          type: 'table',
          dataset: 'schools.growth',
          path: 'tables.newSchools',
          title: 'Newest schools',
          subtitle: 'Joined in this period',
          span: 3,
          maxRows: 6,
        },
      ],
    },
  ],
};

export default schools;
