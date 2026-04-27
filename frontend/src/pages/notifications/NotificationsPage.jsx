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
  BOOKING_REQUESTED: 'bg-purple-100 text-purple-700',
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
  const [query, setQuery] = useState('');
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
    const baseList =
      activeTab === 'unread' ? notifications.filter((item) => !item.read && !item.isRead) : notifications;

    if (!query.trim()) return baseList;
    const q = query.toLowerCase();
    return baseList.filter((item) =>
      [item.title, item.message, item.type].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [activeTab, notifications, query]);

  const summary = useMemo(() => {
    const unread = notifications.filter((item) => !item.read && !item.isRead).length;
    return {
      total: notifications.length,
      unread,
      read: notifications.length - unread
    };
  }, [notifications]);

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
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1600&q=80"
          alt="Notification center"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061944] via-[#0b2c63] to-[#0f766e]/70" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black">Notification Center</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Stay updated with booking decisions, ticket progress, and new comments in one timeline.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total notifications</p>
          <p className="mt-1 text-3xl font-black text-[#0b2c63]">{summary.total}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Unread</p>
          <p className="mt-1 text-3xl font-black text-amber-600">{summary.unread}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Read</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">{summary.read}</p>
        </article>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Timeline</h2>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Mark all as read
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notification title, message, or type..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none ring-[#0b2c63]/20 focus:ring"
        />
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
