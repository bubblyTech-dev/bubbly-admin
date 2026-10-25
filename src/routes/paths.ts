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
  account: `/account`,
  login: `/login`,
  forgotPassword: `/forgot-password`,
  resetPassword: `/reset-password`,
  changePassword: `/change-password`,
  notifications: `/notifications`,

  404: `/404`,
};

// the address of one staff member
export const userPath = (uuid: string) => `/users/${uuid}`;

export default paths;
