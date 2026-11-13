import { ReportAreaConfig } from 'types/reports';

const subscriptions: ReportAreaConfig = {
  area: 'subscriptions',
  title: 'Subscriptions',
  icon: 'material-symbols:credit-score-outline-rounded',
  description: 'Active, expiring, ended and problem subscriptions.',
  order: 30,
  reports: [
    'subscriptions.active',
    'subscriptions.expiring',
    'subscriptions.ended',
    'subscriptions.problem',
    'subscriptions.history',
  ],
};

export default subscriptions;
