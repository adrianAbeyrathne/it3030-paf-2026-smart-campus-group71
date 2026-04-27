import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { CalendarIcon, CommentIcon, WrenchIcon } from '../components/icons';
import {
  getNotifications,
  markAllAsRead
} from '../api/notificationApi';
import { formatTimestamp } from '../utils/dateTime';

const tabs = ['ALL', 'UNREAD'];

function NotificationsPage() {
  const { refreshUnreadCount } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        toast.error('Failed to load notifications');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'UNREAD') {
      return notifications.filter((notification) => !notification.read);
    }
    return notifications;
  }, [activeTab, notifications]);

  const iconByType = (type) => {
    if (type?.startsWith('BOOKING_')) {
      return {
        icon: <CalendarIcon className="h-5 w-5" />,
        containerClass: 'bg-blue-100 text-blue-700'
      };
    }

    if (type === 'TICKET_STATUS_CHANGED') {
      return {
        icon: <WrenchIcon className="h-5 w-5" />,
        containerClass: 'bg-orange-100 text-orange-700'
      };
    }

    return {
      icon: <CommentIcon className="h-5 w-5" />,
      containerClass: 'bg-purple-100 text-purple-700'
    };
  };

  const onMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true, isRead: true })));
      refreshUnreadCount();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[32px] font-bold leading-tight text-[#1F2937]">Notifications</h1>

        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="w-fit text-[14px] font-semibold text-[#1E3A5F] transition hover:text-[#172F4D] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count = tab === 'ALL' ? notifications.length : unreadCount;
          const label = tab === 'ALL' ? 'All Notifications' : 'Unread';

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[14px] font-semibold transition ${
                isActive
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white text-[#1F2937] hover:bg-slate-50'
              }`}
            >
              <span>{label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[12px] ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are all caught up. New updates will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {filteredNotifications.map((notification, index) => {
            const iconData = iconByType(notification.type);
            const isUnread = !notification.read;

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 px-6 py-5 ${
                  isUnread ? 'bg-[#EFF6FF]' : 'bg-white'
                } ${index !== filteredNotifications.length - 1 ? 'border-b border-slate-200' : ''}`}
              >
                <div className={`mt-1 rounded-full p-2 ${iconData.containerClass}`}>{iconData.icon}</div>

                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1F2937]">{notification.title}</p>
                  <p className="mt-1 text-[14px] text-[#6B7280]">{notification.message}</p>
                </div>

                <p className="whitespace-nowrap text-[12px] text-[#6B7280]">
                  {formatTimestamp(notification.createdAt || notification.updatedAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
