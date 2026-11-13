import { ReportAreaConfig } from 'types/reports';

const userAccess: ReportAreaConfig = {
  area: 'user-access',
  title: 'User & Access',
  icon: 'material-symbols:manage-accounts-outline-rounded',
  description: 'Staff accounts, who may do what, sign-ins, devices and accounts that are not used.',
  order: 90,
  reports: [
    'users.staff_directory',
    'users.permission_matrix',
    'users.login_history',
    'users.active_sessions',
    'users.inactive_staff',
  ],
};

export default userAccess;
