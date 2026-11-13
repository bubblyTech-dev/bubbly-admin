import api from 'lib/api';
import { AuthPayload, AuthUser } from 'types/auth';

// One function per endpoint under /admin/auth. Components never call axios directly.
export const authService = {
  async login(email: string, password: string): Promise<AuthPayload> {
    const res = await api.post('/admin/auth/login', { email, password });
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/admin/auth/logout');
  },

  async me(): Promise<AuthUser> {
    const res = await api.get('/admin/auth/me');
    return res.data.data.user;
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await api.post('/admin/auth/forgot-password', { email });
    return res.data.message;
  },

  async resetPassword(input: {
    token: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<string> {
    const res = await api.post('/admin/auth/reset-password', input);
    return res.data.message;
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
  }): Promise<AuthUser> {
    const res = await api.post('/admin/auth/change-password', input);
    return res.data.data.user;
  },
};
