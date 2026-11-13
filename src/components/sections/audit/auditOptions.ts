// What the audit filters offer. action is matched from the start, so "admin_user.session" finds
// both a single ended session and all sessions ended.
export const auditActionOptions = [
  { value: '', label: 'All actions' },
  { value: 'admin_user.created', label: 'Staff added' },
  { value: 'admin_user.updated', label: 'Staff edited' },
  { value: 'admin_user.status_changed', label: 'Staff status changed' },
  { value: 'admin_user.password_reset', label: 'Staff password set' },
  { value: 'admin_user.permissions_changed', label: 'Staff permissions changed' },
  { value: 'admin_user.session', label: 'Staff sessions ended' },
  { value: 'admin_user.deleted', label: 'Staff removed' },
];

export const auditEntityOptions = [
  { value: '', label: 'All records' },
  { value: 'admin_user', label: 'Staff' },
];
