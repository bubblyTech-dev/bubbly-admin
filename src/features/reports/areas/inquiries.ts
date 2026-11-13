import { ReportAreaConfig } from 'types/reports';

const inquiries: ReportAreaConfig = {
  area: 'inquiries',
  title: 'Inquiries',
  icon: 'material-symbols:inbox-outline-rounded',
  description:
    'Website inquiries: the full list, counts by source, status or owner, response times and spam.',
  order: 70,
  reports: ['inquiries.list', 'inquiries.grouped', 'inquiries.response_times', 'inquiries.spam'],
};

export default inquiries;
