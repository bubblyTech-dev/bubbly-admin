import api from 'lib/api';
import { PageMeta, Plan, PlanInput, PlanListQuery, PlanOptions } from 'types/plans';

export const planService = {
  async options(): Promise<PlanOptions> {
    const res = await api.get('/admin/plans/options');
    return res.data.data;
  },

  async list(query: PlanListQuery): Promise<{ plans: Plan[]; meta: PageMeta }> {
    const res = await api.get('/admin/plans', { params: query });
    return { plans: res.data.data, meta: res.data.meta };
  },

  async get(uuid: string): Promise<Plan> {
    const res = await api.get(`/admin/plans/${uuid}`);
    return res.data.data.plan;
  },

  async create(input: PlanInput): Promise<Plan> {
    const res = await api.post('/admin/plans', input);
    return res.data.data.plan;
  },

  async update(uuid: string, input: PlanInput): Promise<Plan> {
    const res = await api.patch(`/admin/plans/${uuid}`, input);
    return res.data.data.plan;
  },

  async publish(uuid: string): Promise<Plan> {
    const res = await api.post(`/admin/plans/${uuid}/publish`);
    return res.data.data.plan;
  },

  // creates a published plan on Razorpay (does nothing if it is already there)
  async syncGateway(uuid: string): Promise<Plan> {
    const res = await api.post(`/admin/plans/${uuid}/sync-gateway`);
    return res.data.data.plan;
  },

  async archive(uuid: string): Promise<Plan> {
    const res = await api.post(`/admin/plans/${uuid}/archive`);
    return res.data.data.plan;
  },

  async duplicate(uuid: string): Promise<Plan> {
    const res = await api.post(`/admin/plans/${uuid}/duplicate`);
    return res.data.data.plan;
  },

  async remove(uuid: string): Promise<void> {
    await api.delete(`/admin/plans/${uuid}`);
  },
};
