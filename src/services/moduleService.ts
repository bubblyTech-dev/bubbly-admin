import api from 'lib/api';
import { ModuleInput, PlanModule } from 'types/plans';

export const moduleService = {
  async list(): Promise<PlanModule[]> {
    const res = await api.get('/admin/modules');
    return res.data.data.modules;
  },

  async update(uuid: string, input: ModuleInput): Promise<PlanModule> {
    const res = await api.patch(`/admin/modules/${uuid}`, input);
    return res.data.data.module;
  },
};
