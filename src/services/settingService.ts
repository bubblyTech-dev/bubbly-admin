import api from 'lib/api';
import { SettingGroup } from 'types/settings';

// The values are sent as typed in the form; the backend checks and converts them (see backend config/settings.js).
export type SettingValues = Record<string, string | boolean | string[]>;

export const settingService = {
  async list(): Promise<SettingGroup[]> {
    const res = await api.get('/admin/settings');
    return res.data.data;
  },

  async saveGroup(group: string, values: SettingValues): Promise<SettingGroup> {
    const res = await api.put(`/admin/settings/${group}`, values);
    return res.data.data;
  },
};
