// 1: Active, 2: Suspended, 3: Archived
export const SCHOOL_STATUS = {
  ACTIVE: 1,
  SUSPENDED: 2,
  ARCHIVED: 3,
} as const;

export type SchoolStatus = (typeof SCHOOL_STATUS)[keyof typeof SCHOOL_STATUS];

export interface School {
  uuid: string;
  name: string;
  slug: string;
  status: SchoolStatus;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  gstNumber: string | null;
  logo: string | null; // full link, ready to use in <img>
  timezone: string | null;
  razorpayCustomerId: string | null; // set the first time a subscription is created
  createdAt: string;
  updatedAt: string;
}

// what the add and edit form sends. Send only what you want to change.
//   logo        the temp name returned by fileService.upload('clientLogo', ...)
//   removeLogo  true to delete the current logo
export interface SchoolInput {
  name?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  gstNumber?: string;
  timezone?: string;
  logo?: string;
  removeLogo?: boolean;
}

export interface SchoolNote {
  uuid: string;
  note: string;
  createdBy: { uuid: string; name: string | null } | null;
  createdAt: string;
}

export interface SchoolStatusHistoryItem {
  uuid: string;
  fromStatus: SchoolStatus;
  toStatus: SchoolStatus;
  reason: string;
  changedBy: { uuid: string; name: string | null } | null;
  createdAt: string;
}

export interface SchoolUsage {
  students: number;
  teachers: number;
  classes: number;
  storageMb: number;
}

export interface PageMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface PagedResult<T> {
  data: T[];
  meta: PageMeta;
}

export interface SchoolListParams {
  search?: string;
  status?: SchoolStatus;
  page?: number;
  perPage?: number;
}

// ---- per-school overrides of the plan's modules and limits ----

export interface EntitlementSubscription {
  uuid: string;
  status: string;
  planName: string;
  endsAt: string | null;
}

export interface ModuleOverride {
  access: 'grant' | 'revoke';
  reason: string;
  createdAt: string;
  createdByName: string | null;
}

export interface EntitlementModule {
  uuid: string;
  key: string;
  name: string;
  description: string | null;
  isCore: boolean;
  includedByPlan: boolean;
  override: ModuleOverride | null;
  effective: boolean;
}

export interface LimitOverride {
  // null = unlimited
  value: number | null;
  reason: string;
  createdAt: string;
  createdByName: string | null;
}

export interface EntitlementLimit {
  key: string;
  label: string;
  // null = unlimited
  planValue: number | null;
  override: LimitOverride | null;
  effectiveValue: number | null;
  usage?: number;
}

export interface SchoolEntitlements {
  subscription: EntitlementSubscription | null;
  modules: EntitlementModule[];
  limits: EntitlementLimit[];
}
