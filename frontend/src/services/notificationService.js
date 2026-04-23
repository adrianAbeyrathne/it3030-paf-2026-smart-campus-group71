import axiosInstance from '../api/axiosInstance';

const unwrapResponse = (response) => response?.data?.data;

export const getNotifications = async () => {
  const response = await axiosInstance.get('/api/notifications');
  const notifications = unwrapResponse(response) || [];
  return notifications.map((notification) => ({
    ...notification,
    read: Boolean(notification.isRead)
  }));
};

export const getUnreadCount = async () => {
  const response = await axiosInstance.get('/api/notifications/unread-count');
  return unwrapResponse(response)?.unreadCount || 0;
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.put('/api/notifications/mark-all-read');
  return unwrapResponse(response);
};
