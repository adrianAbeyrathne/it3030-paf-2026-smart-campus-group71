import axiosInstance from './axiosInstance';

const getData = (response) => {
  const payload = response?.data;
  return payload?.data ?? payload;
};

export const getNotifications = async () => {
  const response = await axiosInstance.get('/api/notifications');
  return getData(response) ?? [];
};

export const getUnreadCount = async () => {
  const response = await axiosInstance.get('/api/notifications/unread-count');
  const data = getData(response);
  return Number(data?.unreadCount ?? 0);
};

export const markAsRead = async (id) => {
  const response = await axiosInstance.put(`/api/notifications/${id}/read`);
  return getData(response);
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.put('/api/notifications/mark-all-read');
  return getData(response);
};

export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/api/notifications/${id}`);
  return getData(response);
};

const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

export default notificationService;
