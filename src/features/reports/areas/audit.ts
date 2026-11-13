import { ReportAreaConfig } from 'types/reports';

const audit: ReportAreaConfig = {
  area: 'audit',
  title: 'Audit',
  icon: 'material-symbols:history-rounded',
  description:
    'The full record of what was done, and a shorter list of the actions that matter most.',
  order: 100,
  reports: ['audit.log', 'audit.sensitive_actions'],
};

export default audit;
