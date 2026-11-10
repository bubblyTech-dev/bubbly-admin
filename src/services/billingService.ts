import api from 'lib/api';
import {
  Invoice,
  ListQuery,
  OfflinePaymentInput,
  Paged,
  Payment,
  WebhookEvent,
  WebhookEventListQuery,
} from 'types/billing';

// The Billing pages: payments and invoices (read only) and the log of payment-provider webhook calls.
export const billingService = {
  async listPayments(query: ListQuery): Promise<Paged<Payment>> {
    const res = await api.get('/admin/payments', { params: query });
    return { items: res.data.data, meta: res.data.meta };
  },

  async getPayment(uuid: string): Promise<Payment> {
    const res = await api.get(`/admin/payments/${uuid}`);
    return res.data.data.payment;
  },

  // the payment methods staff can choose from (set in Settings)
  async offlineOptions(): Promise<string[]> {
    const res = await api.get('/admin/payments/offline-options');
    return res.data.data.methods;
  },

  // records money received outside Razorpay; the admin decides how long the school may use the product
  async recordOffline(
    input: OfflinePaymentInput,
  ): Promise<{ payment: Payment; invoice: Invoice | null }> {
    const res = await api.post('/admin/payments/offline', input);
    return { payment: res.data.data.payment, invoice: res.data.data.invoice };
  },

  async listInvoices(query: ListQuery): Promise<Paged<Invoice>> {
    const res = await api.get('/admin/invoices', { params: query });
    return { items: res.data.data, meta: res.data.meta };
  },

  async getInvoice(uuid: string): Promise<Invoice> {
    const res = await api.get(`/admin/invoices/${uuid}`);
    return res.data.data.invoice;
  },

  // the invoice as a PDF file (the server makes it on the first download)
  async downloadInvoicePdf(uuid: string): Promise<Blob> {
    const res = await api.get(`/admin/invoices/${uuid}/pdf`, { responseType: 'blob' });
    return res.data;
  },

  // the reasons an admin can pick when refunding (set in Settings)
  async refundReasons(): Promise<string[]> {
    const res = await api.get('/admin/payments/refund-options');
    return res.data.data.reasons;
  },

  // amountPaise left out refunds the whole refundable balance. `warning` explains a step that could not be done
  // (for example the subscription could not be cancelled) while the refund itself went through.
  async refundPayment(
    uuid: string,
    input: { amountPaise?: number; reason: string; note?: string; cancelSubscription?: boolean },
  ): Promise<{ payment: Payment; warning: string | null }> {
    const res = await api.post(`/admin/payments/${uuid}/refund`, input);
    return { payment: res.data.data.payment, warning: res.data.data.warning };
  },

  async listEvents(query: WebhookEventListQuery): Promise<Paged<WebhookEvent>> {
    const res = await api.get('/admin/webhook-events', { params: query });
    return { items: res.data.data, meta: res.data.meta };
  },

  async getEvent(uuid: string): Promise<WebhookEvent> {
    const res = await api.get(`/admin/webhook-events/${uuid}`);
    return res.data.data.event;
  },

  // runs a failed event again; resolves with what happened ('processed', 'failed', ...)
  async reprocessEvent(uuid: string): Promise<{ outcome: string; message: string }> {
    const res = await api.post(`/admin/webhook-events/${uuid}/reprocess`);
    return { outcome: res.data.data.outcome, message: res.data.message };
  },
};
