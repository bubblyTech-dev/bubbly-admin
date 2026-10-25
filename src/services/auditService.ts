import api from 'lib/api';
import { AuditLogEntry, Paginated } from 'types/staff';

export interface AuditListParams {
  search?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}

export const auditService = {
  async list(params: AuditListParams): Promise<Paginated<AuditLogEntry>> {
    // empty filters are left out of the address
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== undefined),
    );
    const res = await api.get('/admin/audit-logs', { params: clean });
    return { data: res.data.data, meta: res.data.meta };
  },
};
