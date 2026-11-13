import { ReportAreaConfig } from 'types/reports';

const plans: ReportAreaConfig = {
  area: 'plans',
  title: 'Plans',
  icon: 'material-symbols:sell-outline',
  description: 'The plan catalogue and how many schools are on each plan.',
  order: 20,
  reports: ['plans.catalogue', 'plans.subscribers'],
};

export default plans;
