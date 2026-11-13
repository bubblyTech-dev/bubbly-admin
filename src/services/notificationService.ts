import api from 'lib/api';
import { AdminNotificationList } from 'types/adminNotifications';

// The header bell: what needs attention now, and "mark all as read".
export const notificationService = {
  async list(): Promise<AdminNotificationList> {
    const res = await api.get('/admin/notifications');
    return res.data.data;
  },

  async markSeen(): Promise<void> {
    await api.post('/admin/notifications/seen');
  },
};
