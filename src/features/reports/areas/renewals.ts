import { ReportAreaConfig } from 'types/reports';

const renewals: ReportAreaConfig = {
  area: 'renewals',
  title: 'Renewals',
  icon: 'material-symbols:event-available-outline',
  description: 'Upcoming renewals, renewal outcomes and churn.',
  order: 60,
  reports: ['renewals.upcoming', 'renewals.outcomes', 'renewals.churn'],
};

export default renewals;
