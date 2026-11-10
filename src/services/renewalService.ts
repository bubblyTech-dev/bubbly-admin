import api from 'lib/api';
import { RenewalCounts, RenewalListMeta, RenewalListQuery, RenewalRow } from 'types/renewals';

export const renewalService = {
  // the number on each tab and the money that is due soon
  async counts(): Promise<RenewalCounts> {
    const res = await api.get('/admin/renewals/counts');
    return res.data.data;
  },

  async list(query: RenewalListQuery): Promise<{ rows: RenewalRow[]; meta: RenewalListMeta }> {
    const res = await api.get('/admin/renewals', { params: query });
    return { rows: res.data.data, meta: res.data.meta };
  },
};
