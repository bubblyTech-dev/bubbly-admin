export const rootPaths = {
  root: '/',
};

const paths = {
  root: rootPaths.root,
  users: `/users`,
  userDetail: `/users/:uuid`,
  auditLogs: `/audit-logs`,
  plans: `/plans`,
  plansNew: `/plans/new`,
  modules: `/modules`,
  schools: `/schools`,
  schoolNew: `/schools/new`,
  schoolDetail: `/schools/:uuid`,
  subscriptions: `/subscriptions`,
  renewals: `/renewals`,
  payments: `/payments`,
  invoices: `/invoices`,
  webhookEvents: `/webhook-events`,
  inquiries: `/inquiries`,
  account: `/account`,
  settings: `/settings`,
  login: `/login`,
  forgotPassword: `/forgot-password`,
  resetPassword: `/reset-password`,
  changePassword: `/change-password`,
  notifications: `/notifications`,
  announcements: `/announcements`,
  announcementNew: `/announcements/new`,

  analytics: `/analytics`,
  analyticsArea: `/analytics/:area`,
  reports: `/reports`,
  reportsArea: `/reports/:area`,

  404: `/404`,
};

// the address of one staff member
export const userPath = (uuid: string) => `/users/${uuid}`;
// the address of one school, by its uuid
export const schoolPath = (uuid: string) => `/schools/${uuid}`;

// the address of one Analytics page / one Reports page
export const analyticsPath = (area: string) => `/analytics/${area}`;
export const reportsPath = (area: string) => `/reports/${area}`;

export default paths;
