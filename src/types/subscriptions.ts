// 1: Pending, 2: Active, 3: Past due, 4: Cancelled, 5: Expired, 6: Suspended
export const SUBSCRIPTION_STATUS = {
  PENDING: 1,
  ACTIVE: 2,
  PAST_DUE: 3,
  CANCELLED: 4,
  EXPIRED: 5,
  SUSPENDED: 6,
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = {
  1: 'Pending',
  2: 'Active',
  3: 'Past due',
  4: 'Cancelled',
  5: 'Expired',
  6: 'Suspended',
};

export const subscriptionStatusColor: Record<
  SubscriptionStatus,
  'default' | 'success' | 'warning' | 'error' | 'info'
> = {
  1: 'info',
  2: 'success',
  3: 'warning',
  4: 'default',
  5: 'default',
  6: 'error',
};

export interface Subscription {
  uuid: string;
  status: SubscriptionStatus;
  client?: { uuid: string; name: string };
  plan?: { uuid: string; name: string; version: number };
  razorpaySubscriptionId: string | null;
  razorpayPlanId: string | null;
  razorpayCustomerId: string | null;
  billingInterval: number;
  amountPaise: number;
  currency: string;
  totalCount: number | null;
  paidCount: number;
  remainingCount: number | null;
  startedAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextChargeAt: string | null;
  cancelAtCycleEnd: boolean;
  cancelRequestedAt: string | null;
  cancelledAt: string | null;
  endedAt: string | null;
  shortUrl: string | null; // the Razorpay page where the school authorises the payment
  createdAt: string;
}

export interface SubscriptionListQuery {
  search?: string;
  status?: number;
  plan?: string;
  page?: number;
  perPage?: number;
}
