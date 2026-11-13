import { BreakdownItem, Kpi, RangeInfo, Series } from 'types/analytics';

// What GET /admin/dashboard returns. A block the admin may not see arrives as null and is hidden.

export interface DashboardKpis {
  totalSchools:
    | (Kpi & { breakdown: { active: number; suspended: number; archived: number } })
    | null;
  newSchools: Kpi | null;
  activeSubscriptions: Kpi | null;
  mrr: (Kpi & { arrPaise: number }) | null;
  revenue: (Kpi & { gstPaise: number; refundedPaise: number }) | null;
  renewalsDue: (Kpi & { windowDays: number }) | null;
  pastDue: (Kpi & { failedPaymentsInRange: number }) | null;
  newInquiries: (Kpi & { waiting: number }) | null;
}

export interface DashboardCharts {
  revenueByMonth: Series | null;
  newSchoolsByMonth: Series | null;
  subscriptionsByStatus: BreakdownItem[] | null;
  schoolsPerPlan: BreakdownItem[] | null;
}

export type AttentionSeverity = 'error' | 'warning' | 'info';

export interface AttentionItem {
  key: string;
  label: string;
  count: number;
  severity: AttentionSeverity;
  link: string;
}

export interface ActivityRow {
  uuid: string;
  action: string;
  text: string;
  actorName: string | null;
  entityType: string | null;
  createdAt: string;
}

export interface LatestSchool {
  uuid: string;
  name: string;
  city: string | null;
  status: number;
  statusLabel: string;
  planName: string | null;
  createdAt: string;
}

export interface LatestPayment {
  uuid: string;
  schoolName: string | null;
  amountPaise: number;
  status: number;
  statusLabel: string;
  source: 'online' | 'offline';
  at: string;
}

export interface LiveAnnouncement {
  uuid: string;
  title: string;
  type: number;
  typeLabel: string;
  startsAt: string | null;
  endsAt: string | null;
}

export interface DashboardData {
  range: RangeInfo;
  generatedAt: string;
  currency: string;
  kpis: DashboardKpis;
  charts: DashboardCharts;
  attention: AttentionItem[];
  panels: {
    recentActivity: ActivityRow[] | null;
    latestSchools: LatestSchool[] | null;
    latestPayments: LatestPayment[] | null;
    liveAnnouncements: LiveAnnouncement[] | null;
  };
}

export type DashboardPreset =
  | 'this_month'
  | 'last_month'
  | 'last_30_days'
  | 'this_quarter'
  | 'this_fiscal_year'
  | 'last_12_months';
