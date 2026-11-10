import { PageMeta } from 'types/plans';
import { SubscriptionStatus } from 'types/subscriptions';

export type RenewalTab = 'due_soon' | 'payment_failed' | 'in_grace' | 'suspended';

export const renewalTabs: { value: RenewalTab; label: string }[] = [
  { value: 'due_soon', label: 'Due soon' },
  { value: 'payment_failed', label: 'Payment failed' },
  { value: 'in_grace', label: 'In grace period' },
  { value: 'suspended', label: 'Suspended' },
];

// 1: paid through Razorpay, 2: recorded by hand (offline)
export const RENEWAL_SOURCE = { RAZORPAY: 1, OFFLINE: 2 } as const;

export interface RenewalRow {
  uuid: string; // the subscription
  status: SubscriptionStatus;
  school: { uuid: string; name: string } | null;
  plan: { uuid: string; name: string } | null;
  amountPaise: number;
  currency: string;
  source: number;
  razorpaySubscriptionId: string | null;
  cancelAtCycleEnd: boolean;
  dateLabel: string; // what the date means: Next charge, Failed on, Grace ends, Suspended on
  date: string | null;
  // days until the date; negative = days since it
  daysLeft: number | null;
  currentPeriodEnd: string | null;
  nextChargeAt: string | null;
}

export interface RenewalListMeta extends PageMeta {
  tab: RenewalTab;
  dueSoonDays: number;
  graceDays: number;
}

export interface RenewalCounts {
  counts: Record<RenewalTab, number>;
  summary: {
    dueSoonAmountPaise: number;
    currency: string;
    dueSoonDays: number;
    graceDays: number;
  };
}

export interface RenewalListQuery {
  tab: RenewalTab;
  search?: string;
  page?: number;
  perPage?: number;
}
