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

// where a payment or subscription comes from: 1: Razorpay, 2: Offline (recorded by staff)
export type BillingSource = 1 | 2;
export const BILLING_SOURCE = { RAZORPAY: 1, OFFLINE: 2 } as const;
export const billingSourceLabel: Record<BillingSource, string> = { 1: 'Online', 2: 'Offline' };

export interface Payment {
  uuid: string;
  status: PaymentStatus;
  source: BillingSource;
  reference: string | null; // bank reference, cheque number or UPI id of an offline payment
  notes: string | null;
  recordedBy?: string; // the staff member who recorded an offline payment
  client?: { uuid: string; name: string };
  subscriptionUuid?: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  razorpayInvoiceId: string | null;
  razorpayRefundId: string | null;
  method: string | null;
  amountPaise: number;
  currency: string;
  feePaise: number | null;
  taxPaise: number | null;
  refundedPaise: number;
  // what can still be refunded (0 unless the payment is paid or partly refunded)
  refundablePaise: number;
  // recorded by staff (no Razorpay payment id): a refund of it is only recorded
  offline: boolean;
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
  source?: number;
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

// ---------- offline payments ----------
export interface OfflinePaymentInput {
  schoolUuid: string;
  planUuid: string;
  amountPaise: number;
  paidAt: string; // YYYY-MM-DD
  method: string;
  reference?: string;
  validUntil: string; // YYYY-MM-DD, the last day the school may use the product
  notes?: string;
}
