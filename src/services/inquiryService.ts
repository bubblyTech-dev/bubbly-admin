import api from 'lib/api';
import { Inquiry, InquiryAssignee, InquiryCounts, InquiryNote, PageMeta } from 'types/inquiries';

interface ListParams {
  search?: string;
  status?: number | '';
  source?: number | '';
  assignedTo?: string;
  page?: number;
  perPage?: number;
}

// One function per endpoint under /admin/inquiries.
export const inquiryService = {
  async list(params: ListParams): Promise<{ data: Inquiry[]; meta: PageMeta }> {
    // empty filters are left out of the address
    const query = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== undefined),
    );
    const res = await api.get('/admin/inquiries', { params: query });
    return { data: res.data.data, meta: res.data.meta };
  },

  async show(uuid: string): Promise<Inquiry> {
    const res = await api.get(`/admin/inquiries/${uuid}`);
    return res.data.data.inquiry;
  },

  async counts(): Promise<InquiryCounts> {
    const res = await api.get('/admin/inquiries/counts');
    return res.data.data;
  },

  async assignees(): Promise<InquiryAssignee[]> {
    const res = await api.get('/admin/inquiries/assignees');
    return res.data.data;
  },

  async updateStatus(uuid: string, status: number): Promise<Inquiry> {
    const res = await api.patch(`/admin/inquiries/${uuid}/status`, { status });
    return res.data.data.inquiry;
  },

  // staff uuid, or null to remove the assignment
  async assign(uuid: string, assignedTo: string | null): Promise<Inquiry> {
    const res = await api.patch(`/admin/inquiries/${uuid}/assign`, { assignedTo });
    return res.data.data.inquiry;
  },

  async notes(uuid: string): Promise<InquiryNote[]> {
    const res = await api.get(`/admin/inquiries/${uuid}/notes`);
    return res.data.data;
  },

  async addNote(uuid: string, note: string): Promise<InquiryNote> {
    const res = await api.post(`/admin/inquiries/${uuid}/notes`, { note });
    return res.data.data.note;
  },

  async remove(uuid: string): Promise<void> {
    await api.delete(`/admin/inquiries/${uuid}`);
  },
};
