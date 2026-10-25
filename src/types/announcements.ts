export const ANNOUNCEMENT_TYPE = {
  INFO: 1,
  WARNING: 2,
  MAINTENANCE: 3,
} as const;

export const ANNOUNCEMENT_STATUS = {
  DRAFT: 1,
  SCHEDULED: 2,
  PUBLISHED: 3,
  EXPIRED: 4,
} as const;

export const ANNOUNCEMENT_TARGET_TYPE = {
  ALL: 1,
  SCHOOLS: 2,
  PLANS: 3,
} as const;

export const announcementTypeLabels: Record<number, string> = {
  1: 'Info',
  2: 'Warning',
  3: 'Maintenance',
};

export const announcementStatusLabels: Record<number, string> = {
  1: 'Draft',
  2: 'Scheduled',
  3: 'Published',
  4: 'Expired',
};

export const announcementTargetLabels: Record<number, string> = {
  1: 'All schools',
  2: 'Selected schools',
  3: 'Selected plans',
};

export interface AnnouncementTargetItem {
  uuid: string;
  name: string;
}

export interface Announcement {
  uuid: string;
  title: string;
  body: string;
  type: number;
  status: number;
  targetType: number;
  startsAt: string | null;
  endsAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { uuid: string; name: string | null } | null;
  targets?: AnnouncementTargetItem[];
}

export interface AnnouncementInput {
  title?: string;
  body?: string;
  type?: number;
  targetType?: number;
  targetUuids?: string[];
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface AnnouncementListParams {
  search?: string;
  status?: number;
  type?: number;
  page?: number;
  perPage?: number;
}

export interface PageMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}
