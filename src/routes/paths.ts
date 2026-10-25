export const rootPaths = {
  root: '/',
};

const paths = {
  root: rootPaths.root,
  starter: `/starter`,
  users: `/users`,
  userDetail: `/users/:uuid`,
  auditLogs: `/audit-logs`,
  plans: `/plans`,
  plansNew: `/plans/new`,
  modules: `/modules`,
  schools: `/schools`,
  schoolNew: `/schools/new`,
  schoolDetail: `/schools/:uuid`,
  account: `/account`,
  settings: `/settings`,
  login: `/login`,
  forgotPassword: `/forgot-password`,
  resetPassword: `/reset-password`,
  changePassword: `/change-password`,
  notifications: `/notifications`,

  404: `/404`,
};

// the address of one staff member
export const userPath = (uuid: string) => `/users/${uuid}`;
// the address of one school, by its uuid
export const schoolPath = (uuid: string) => `/schools/${uuid}`;

export default paths;
