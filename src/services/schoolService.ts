import api from 'lib/api';
import {
  PagedResult,
  School,
  SchoolInput,
  SchoolListParams,
  SchoolNote,
  SchoolStatus,
  SchoolStatusHistoryItem,
  SchoolUsage,
} from 'types/school';

// One function per endpoint under /admin/schools. Components never call axios directly.
export const schoolService = {
  async list(params: SchoolListParams): Promise<PagedResult<School>> {
    const res = await api.get('/admin/schools', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  async get(uuid: string): Promise<School> {
    const res = await api.get(`/admin/schools/${uuid}`);
    return res.data.data.school;
  },

  async create(input: SchoolInput): Promise<School> {
    const res = await api.post('/admin/schools', input);
    return res.data.data.school;
  },

  async update(uuid: string, input: SchoolInput): Promise<School> {
    const res = await api.patch(`/admin/schools/${uuid}`, input);
    return res.data.data.school;
  },

  async changeStatus(uuid: string, status: SchoolStatus, reason: string): Promise<School> {
    const res = await api.post(`/admin/schools/${uuid}/status`, { status, reason });
    return res.data.data.school;
  },

  async statusHistory(
    uuid: string,
    params: { page?: number; perPage?: number },
  ): Promise<PagedResult<SchoolStatusHistoryItem>> {
    const res = await api.get(`/admin/schools/${uuid}/status-history`, { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  async notes(
    uuid: string,
    params: { page?: number; perPage?: number },
  ): Promise<PagedResult<SchoolNote>> {
    const res = await api.get(`/admin/schools/${uuid}/notes`, { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  async addNote(uuid: string, note: string): Promise<SchoolNote> {
    const res = await api.post(`/admin/schools/${uuid}/notes`, { note });
    return res.data.data.note;
  },

  async remove(uuid: string): Promise<void> {
    await api.delete(`/admin/schools/${uuid}`);
  },

  async usage(uuid: string): Promise<SchoolUsage> {
    const res = await api.get(`/admin/schools/${uuid}/usage`);
    return res.data.data.usage;
  },
};
