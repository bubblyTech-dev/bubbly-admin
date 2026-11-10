import api from 'lib/api';
import {
  Invoice,
  ListQuery,
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

  async listInvoices(query: ListQuery): Promise<Paged<Invoice>> {
    const res = await api.get('/admin/invoices', { params: query });
    return { items: res.data.data, meta: res.data.meta };
  },

  async getInvoice(uuid: string): Promise<Invoice> {
    const res = await api.get(`/admin/invoices/${uuid}`);
    return res.data.data.invoice;
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
