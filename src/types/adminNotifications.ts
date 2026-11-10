// One line in the notification bell of the Admin app.
export type AdminNotificationType = 'inquiry' | 'payment_failed' | 'subscription_past_due';

export interface AdminNotification {
  type: AdminNotificationType;
  uuid: string;
  title: string;
  subtitle: string;
  createdAt: string;
  link: string;
}

export interface AdminNotificationList {
  items: AdminNotification[];
  unreadCount: number;
  lastSeenAt: string | null;
}
