import { PageMeta } from 'types/plans';

export type ChipColor = 'default' | 'success' | 'warning' | 'error' | 'info';

// ---------- payments ----------
// 1: Created, 2: Authorized, 3: Captured, 4: Failed, 5: Refunded, 6: Partially refunded
export type PaymentStatus = 1 | 2 | 3 | 4 | 5 | 6;

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  1: 'Created',
  2: 'Authorized',
  3: 'Paid',
  4: 'Failed',
  5: 'Refunded',
  6: 'Partly refunded',
};

export const paymentStatusColor: Record<PaymentStatus, ChipColor> = {
  1: 'default',
  2: 'info',
  3: 'success',
  4: 'error',
  5: 'warning',
  6: 'warning',
};

export interface Payment {
  uuid: string;
  status: PaymentStatus;
  client?: { uuid: string; name: string };
  subscriptionUuid?: string;
  razorpayPaymentId: string;
  razorpayOrderId: string | null;
  razorpayInvoiceId: string | null;
  razorpayRefundId: string | null;
  method: string | null;
  amountPaise: number;
  currency: string;
  feePaise: number | null;
  taxPaise: number | null;
  refundedPaise: number;
  failureCode: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  // only on the detail view
  gatewayData?: Record<string, unknown> | null;
}

// ---------- invoices ----------
// 1: Draft, 2: Issued, 3: Paid, 4: Void
export type InvoiceStatus = 1 | 2 | 3 | 4;

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  1: 'Draft',
  2: 'Issued',
  3: 'Paid',
  4: 'Void',
};

export const invoiceStatusColor: Record<InvoiceStatus, ChipColor> = {
  1: 'default',
  2: 'info',
  3: 'success',
  4: 'error',
};

export interface InvoiceParty {
  name: string | null;
  address: string | null;
  gstNumber: string | null;
}

export interface Invoice {
  uuid: string;
  invoiceNo: string;
  status: InvoiceStatus;
  client?: { uuid: string; name: string };
  subscriptionUuid?: string;
  razorpayPaymentId?: string;
  razorpayInvoiceId: string | null;
  issuedAt: string;
  periodStart: string | null;
  periodEnd: string | null;
  subtotalPaise: number;
  taxPaise: number;
  totalPaise: number;
  taxRatePercent: number;
  seller: InvoiceParty;
  buyer: InvoiceParty;
  pdfAvailable: boolean;
}

// ---------- webhook events ----------
// 1: Received, 2: Processed, 3: Failed, 4: Ignored
export type WebhookEventStatus = 1 | 2 | 3 | 4;

export const webhookStatusLabel: Record<WebhookEventStatus, string> = {
  1: 'Received',
  2: 'Processed',
  3: 'Failed',
  4: 'Ignored',
};

export const webhookStatusColor: Record<WebhookEventStatus, ChipColor> = {
  1: 'info',
  2: 'success',
  3: 'error',
  4: 'default',
};

export const WEBHOOK_STATUS = { RECEIVED: 1, PROCESSED: 2, FAILED: 3, IGNORED: 4 } as const;

export interface WebhookEvent {
  uuid: string;
  provider: string;
  eventId: string;
  eventType: string;
  status: WebhookEventStatus;
  attempts: number;
  receivedAt: string | null;
  processedAt: string | null;
  errorMessage: string | null;
  // only on the detail view
  payload?: Record<string, unknown> | null;
}

// ---------- list queries ----------
export interface ListQuery {
  search?: string;
  status?: number;
  page?: number;
  perPage?: number;
}

export interface WebhookEventListQuery extends ListQuery {
  type?: string;
}

export interface Paged<T> {
  items: T[];
  meta: PageMeta;
}
