import { ReportAreaConfig } from 'types/reports';

// REFERENCE AREA CONFIG: copy this file to add a Reports page. `reports` are report keys from
// backend/app/Services/V1/Admin/Reports/definitions (the pills are shown in this order).
const schools: ReportAreaConfig = {
  area: 'schools',
  title: 'Schools',
  icon: 'material-symbols:school-outline',
  description: 'Lists of schools, ready to filter and download.',
  order: 10,
  reports: ['schools.directory'],
};

export default schools;
