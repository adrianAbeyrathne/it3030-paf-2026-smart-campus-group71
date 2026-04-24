import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import notificationService from '../../services/notificationService';

const formatDate = (value) => {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString();
};

const typeColorMap = {
  BOOKING_APPROVED: 'bg-[#10B981]/20 text-[#047857]',
  BOOKING_REJECTED: 'bg-[#EF4444]/20 text-[#B91C1C]',
  BOOKING_CANCELLED: 'bg-[#F59E0B]/20 text-[#B45309]',
  TICKET_STATUS_CHANGED: 'bg-[#3B82F6]/20 text-[#1D4ED8]',
  NEW_COMMENT: 'bg-[#1E3A5F]/15 text-[#1E3A5F]'
};

const formatType = (value) =>
  (value || '')
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((item) => !item.read && !item.isRead);
    }
    return notifications;
  }, [activeTab, notifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true, read: true } : item))
      );
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading notifications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Mark all as read
        </button>
      </div>

      <div className="inline-flex rounded-md border border-slate-300 bg-white p-1">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded px-4 py-2 text-sm font-medium ${
            activeTab === 'all' ? 'bg-[#1E3A5F] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={`rounded px-4 py-2 text-sm font-medium ${
            activeTab === 'unread' ? 'bg-[#1E3A5F] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No notifications to show.
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isUnread = !item.read && !item.isRead;

            return (
              <article
                key={item.id}
                className={`rounded-xl border p-4 shadow-sm ${
                  isUnread ? 'border-[#F59E0B]/40 bg-[#FEFCE8]' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          typeColorMap[item.type] || 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {formatType(item.type)}
                      </span>
                      {isUnread && (
                        <span className="rounded-full bg-[#F59E0B]/20 px-2 py-0.5 text-[10px] font-semibold text-[#B45309]">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        className="rounded border border-[#10B981]/40 px-2.5 py-1 text-xs font-medium text-[#047857] hover:bg-[#10B981]/10"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded border border-[#EF4444]/40 px-2.5 py-1 text-xs font-medium text-[#B91C1C] hover:bg-[#EF4444]/10"
                      aria-label="Delete notification"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
