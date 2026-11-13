import { ReportAreaConfig } from 'types/reports';

const announcements: ReportAreaConfig = {
  area: 'announcements',
  title: 'Announcements',
  icon: 'material-symbols:event-note-outline-rounded',
  description: 'What was announced to schools, and what is live or scheduled now.',
  order: 80,
  reports: ['announcements.history', 'announcements.live'],
};

export default announcements;
