import api from 'lib/api';
import {
  Announcement,
  AnnouncementInput,
  AnnouncementListParams,
  AnnouncementTargetItem,
  PageMeta,
} from 'types/announcements';

export const announcementService = {
  async list(params: AnnouncementListParams): Promise<{ data: Announcement[]; meta: PageMeta }> {
    const res = await api.get('/admin/announcements', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  // the schools (targetType 2) or plans (3) that can be picked as the audience
  async targetOptions(targetType: number, search: string): Promise<AnnouncementTargetItem[]> {
    const res = await api.get('/admin/announcements/target-options', {
      params: { targetType, search: search || undefined },
    });
    return res.data.data;
  },

  async get(uuid: string): Promise<Announcement> {
    const res = await api.get(`/admin/announcements/${uuid}`);
    return res.data.data;
  },

  async create(input: AnnouncementInput): Promise<Announcement> {
    const res = await api.post('/admin/announcements', input);
    return res.data.data;
  },

  async update(uuid: string, input: AnnouncementInput): Promise<Announcement> {
    const res = await api.patch(`/admin/announcements/${uuid}`, input);
    return res.data.data;
  },

  async publish(uuid: string): Promise<Announcement> {
    const res = await api.post(`/admin/announcements/${uuid}/publish`);
    return res.data.data;
  },

  async unpublish(uuid: string): Promise<Announcement> {
    const res = await api.post(`/admin/announcements/${uuid}/unpublish`);
    return res.data.data;
  },

  async remove(uuid: string): Promise<void> {
    await api.delete(`/admin/announcements/${uuid}`);
  },
};
