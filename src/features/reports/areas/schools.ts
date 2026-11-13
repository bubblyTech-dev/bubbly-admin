import { ReportAreaConfig } from 'types/reports';

const schools: ReportAreaConfig = {
  area: 'schools',
  title: 'Schools',
  icon: 'material-symbols:school-outline',
  description: 'Lists of schools, ready to filter and download.',
  order: 10,
  reports: [
    'schools.directory',
    'schools.new_schools',
    'schools.status_changes',
    'schools.contacts_gst',
    'schools.without_subscription',
  ],
};

export default schools;
