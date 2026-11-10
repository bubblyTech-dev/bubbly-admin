import api from 'lib/api';
import { PageMeta } from 'types/plans';
import { Subscription, SubscriptionListQuery } from 'types/subscriptions';

export const subscriptionService = {
  async list(
    query: SubscriptionListQuery,
  ): Promise<{ subscriptions: Subscription[]; meta: PageMeta }> {
    const res = await api.get('/admin/subscriptions', { params: query });
    return { subscriptions: res.data.data, meta: res.data.meta };
  },

  async get(uuid: string): Promise<Subscription> {
    const res = await api.get(`/admin/subscriptions/${uuid}`);
    return res.data.data.subscription;
  },

  async forSchool(schoolUuid: string): Promise<Subscription[]> {
    const res = await api.get(`/admin/schools/${schoolUuid}/subscriptions`);
    return res.data.data.subscriptions;
  },

  // Created as Pending; the school pays through the returned shortUrl
  async createForSchool(
    schoolUuid: string,
    input: { planUuid: string; startAt?: string },
  ): Promise<Subscription> {
    const res = await api.post(`/admin/schools/${schoolUuid}/subscriptions`, input);
    return res.data.data.subscription;
  },

  // always stops the subscription at the end of the current billing period
  async cancel(uuid: string): Promise<Subscription> {
    const res = await api.post(`/admin/subscriptions/${uuid}/cancel`);
    return res.data.data.subscription;
  },

  // offline subscriptions only: the last day the school may use the product
  async changeExpiry(uuid: string, validUntil: string): Promise<Subscription> {
    const res = await api.post(`/admin/subscriptions/${uuid}/expiry`, { validUntil });
    return res.data.data.subscription;
  },

  // refreshes one subscription from Razorpay
  async sync(uuid: string): Promise<Subscription> {
    const res = await api.post(`/admin/subscriptions/${uuid}/sync`);
    return res.data.data.subscription;
  },
};
