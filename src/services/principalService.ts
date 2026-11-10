import api from 'lib/api';
import { SchoolPrincipal } from 'types/principal';

// The Principal login of a school: look at it, send a new welcome link, reset the password.
export const principalService = {
  // null when the school has no Principal yet (it is created when the first subscription becomes active)
  async get(schoolUuid: string): Promise<SchoolPrincipal | null> {
    const res = await api.get(`/admin/schools/${schoolUuid}/principal`);
    return res.data.data.principal;
  },

  async resendWelcome(schoolUuid: string): Promise<SchoolPrincipal> {
    const res = await api.post(`/admin/schools/${schoolUuid}/principal/resend-welcome`);
    return res.data.data.principal;
  },

  async resetPassword(schoolUuid: string): Promise<SchoolPrincipal> {
    const res = await api.post(`/admin/schools/${schoolUuid}/principal/reset-password`);
    return res.data.data.principal;
  },
};
