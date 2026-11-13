export const INQUIRY_STATUS = {
  NEW: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  SPAM: 4,
} as const;

export const INQUIRY_STATUS_LABELS: Record<number, string> = {
  1: 'New',
  2: 'In progress',
  3: 'Resolved',
  4: 'Spam',
};

export const INQUIRY_SOURCE_LABELS: Record<number, string> = {
  1: 'Contact form',
  2: 'Demo request',
  3: 'Pricing page',
};

export interface InquiryAssignee {
  uuid: string;
  name: string | null;
  email: string;
}

export interface Inquiry {
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  schoolName: string | null;
  message: string;
  source: number;
  status: number;
  assignedTo: InquiryAssignee | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryNote {
  uuid: string;
  note: string;
  author: { uuid: string; name: string | null } | null;
  createdAt: string;
}

export interface InquiryCounts {
  new: number;
  inProgress: number;
  resolved: number;
  spam: number;
  total: number;
}

export interface InquiryFilters {
  search: string;
  status: number | '';
  source: number | '';
  mine: boolean;
}

export interface PageMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}
