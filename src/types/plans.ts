export type PlanStatus = 1 | 2 | 3; // 1: Draft, 2: Published, 3: Archived
export type BillingInterval = 1 | 2 | 3; // 1: Monthly, 2: Quarterly, 3: Yearly

export interface PlanModule {
  uuid: string;
  moduleKey: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: number; // 1: Active, 2: Inactive
  isCore: boolean;
}

// limit key -> value; null means unlimited
export type PlanLimits = Record<string, number | null>;

export interface PlanFeature {
  uuid: string;
  title: string;
  // the module this feature unlocks for schools on the plan (null = text only)
  moduleKey: string | null;
}

// what the form sends for one feature
export interface PlanFeatureInput {
  title: string;
  moduleKey: string | null;
}

export interface Plan {
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  pricePaise: number;
  currency: string;
  billingInterval: BillingInterval;
  taxInclusive: boolean;
  status: PlanStatus;
  sortOrder: number;
  isFeatured: boolean;
  version: number;
  razorpayPlanId: string | null;
  gatewaySynced: boolean;
  razorpaySyncedAt: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  limits: PlanLimits;
  features: PlanFeature[];
  modules: PlanModule[];
  inUse: number;
}

export interface PlanOptions {
  limits: { key: string; label: string }[];
  intervals: { value: number; label: string }[];
  // banks limit automatic debit to about this many rupees per charge (a note, not a rule)
  maxAutoChargeRupees: number;
}

export interface PageMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface PlanListQuery {
  search?: string;
  status?: number;
  page?: number;
  perPage?: number;
}

// what the form sends; every field is optional on update
export interface PlanInput {
  name?: string;
  slug?: string;
  description?: string;
  pricePaise?: number;
  billingInterval?: number;
  taxInclusive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  limits?: PlanLimits;
  // the whole list, in order (an empty list clears it)
  features?: PlanFeatureInput[];
}

export interface ModuleInput {
  name?: string;
  description?: string;
  status?: number;
  sortOrder?: number;
}
