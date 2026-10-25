import api from 'lib/api';
import {
  LoginHistoryEntry,
  Paginated,
  PermissionGroup,
  StaffCreateInput,
  StaffInput,
  StaffSession,
  StaffUser,
} from 'types/staff';

export interface StaffListParams {
  search?: string;
  status?: number | '';
  page?: number;
  perPage?: number;
}

// Users & Access endpoints under /admin/users. Components never call axios directly.
export const staffService = {
  async list(params: StaffListParams): Promise<Paginated<StaffUser>> {
    const res = await api.get('/admin/users', {
      params: { ...params, status: params.status || undefined, search: params.search || undefined },
    });
    return { data: res.data.data, meta: res.data.meta };
  },

  async get(uuid: string): Promise<StaffUser> {
    const res = await api.get(`/admin/users/${uuid}`);
    return res.data.data.user;
  },

  async create(input: StaffCreateInput): Promise<StaffUser> {
    const res = await api.post('/admin/users', input);
    return res.data.data.user;
  },

  // an empty phone clears it
  async update(uuid: string, input: Partial<StaffInput>): Promise<StaffUser> {
    const res = await api.patch(`/admin/users/${uuid}`, input);
    return res.data.data.user;
  },

  async setStatus(uuid: string, status: 1 | 2): Promise<StaffUser> {
    const res = await api.patch(`/admin/users/${uuid}/status`, { status });
    return res.data.data.user;
  },

  async resetPassword(uuid: string, password: string, passwordConfirmation: string): Promise<void> {
    await api.post(`/admin/users/${uuid}/reset-password`, { password, passwordConfirmation });
  },

  async setPermissions(uuid: string, permissions: string[]): Promise<StaffUser> {
    const res = await api.put(`/admin/users/${uuid}/permissions`, { permissions });
    return res.data.data.user;
  },

  async remove(uuid: string): Promise<void> {
    await api.delete(`/admin/users/${uuid}`);
  },

  async permissions(): Promise<PermissionGroup[]> {
    const res = await api.get('/admin/permissions');
    return res.data.data;
  },

  async sessions(uuid: string): Promise<StaffSession[]> {
    const res = await api.get(`/admin/users/${uuid}/sessions`);
    return res.data.data;
  },

  async revokeSession(uuid: string, sessionUuid: string): Promise<void> {
    await api.delete(`/admin/users/${uuid}/sessions/${sessionUuid}`);
  },

  async revokeAllSessions(uuid: string): Promise<void> {
    await api.delete(`/admin/users/${uuid}/sessions`);
  },

  async loginHistory(
    uuid: string,
    page: number,
    perPage: number,
  ): Promise<Paginated<LoginHistoryEntry>> {
    const res = await api.get(`/admin/users/${uuid}/login-history`, { params: { page, perPage } });
    return { data: res.data.data, meta: res.data.meta };
  },
};
