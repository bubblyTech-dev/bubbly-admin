import { ReportAreaConfig } from 'types/reports';

const system: ReportAreaConfig = {
  area: 'system',
  title: 'System',
  icon: 'material-symbols:monitor-outline-rounded',
  description: 'What the payment provider sent us and what happened to each message.',
  order: 110,
  reports: ['system.webhook_events'],
};

export default system;
