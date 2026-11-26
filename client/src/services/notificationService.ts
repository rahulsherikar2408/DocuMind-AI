import api from "./api";

export interface AppNotification {
  _id: string;
  user: string;
  type: "subscription_purchased" | "plan_expiring_tomorrow" | "general";
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    plan?: string;
    expiresAt?: string;
    billingId?: string;
    expiryKey?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  unreadCount: number;
  notifications: AppNotification[];
}

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const { data } = await api.get<NotificationsResponse>("/api/notifications");
  return data;
};

export const markNotificationAsRead = async (
  id: string
): Promise<AppNotification> => {
  const { data } = await api.patch<{
    success: boolean;
    notification: AppNotification;
  }>(`/api/notifications/${id}/read`);
  return data.notification;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/api/notifications/read-all");
};
