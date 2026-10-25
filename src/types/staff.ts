// What the Users & Access API returns (see backend Resources). Dates are ISO strings.

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

// 1: Active, 2: Inactive, 3: Locked (the lock is set automatically after too many failed logins)
export type StaffStatus = 1 | 2 | 3;

export interface StaffUser {
  uuid: string;
  name: string | null;
  email: string;
  phone: string | null;
  profileImage: string | null;
  status: StaffStatus;
  mustChangePassword: boolean;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  // only on a single staff member, not in lists
  permissions?: string[];
}

export interface StaffInput {
  name: string;
  email: string;
  phone: string;
}

export interface StaffCreateInput extends StaffInput {
  password: string;
  passwordConfirmation: string;
  status?: 1 | 2;
  permissions?: string[];
}

export interface PermissionItem {
  key: string;
  name: string;
}

export interface PermissionGroup {
  module: string;
  label: string;
  items: PermissionItem[];
}

export interface StaffSession {
  uuid: string;
  deviceLabel: string | null;
  ipAddress: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface LoginHistoryEntry {
  uuid: string;
  emailTried: string | null;
  method: number;
  result: 1 | 2; // 1: Success, 2: Failed
  failureReason: 1 | 2 | 3 | 4 | null; // 1: Wrong password, 2: Unknown email, 3: Inactive, 4: Locked
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  uuid: string;
  actorName: string | null;
  action: string;
  description: string | null;
  entityType: string | null;
  entityUuid: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}
