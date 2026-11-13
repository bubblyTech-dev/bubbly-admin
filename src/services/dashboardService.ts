import api from 'lib/api';
import { DashboardData, DashboardPreset } from 'types/dashboard';

export const dashboardService = {
  async get(preset: DashboardPreset, signal?: AbortSignal): Promise<DashboardData> {
    const res = await api.get('/admin/dashboard', { params: { preset }, signal });
    return res.data.data;
  },
};
