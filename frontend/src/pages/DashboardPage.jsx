import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import StatCard from '../components/dashboard/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import resourceApi from '../api/resourceApi';
import notificationApi from '../api/notificationApi';
import statsApi from '../api/statsApi';
import ticketApi from '../api/ticketApi';
import bookingApi from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';

const formatLabel = (value) =>
  (value || '')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const statusStyles = {
  ACTIVE: 'bg-[#10B981]/15 text-[#047857] border-[#10B981]/30',
  OUT_OF_SERVICE: 'bg-[#EF4444]/15 text-[#B91C1C] border-[#EF4444]/30'
};

const bookingStatusStyles = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700'
};

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="11" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="17" width="7" height="4" rx="1.5" />
    </svg>
  );
}

function DashboardPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, outOfService: 0, byType: {} });
  const [unreadCount, setUnreadCount] = useState(0);
  const [resources, setResources] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Schedule state
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySchedule, setDailySchedule] = useState([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [statsResult, resourcesResult, unreadResult, ticketsResult] = await Promise.all([
          statsApi.getResourceStats(),
          resourceApi.getAllResources(),
          notificationApi.getUnreadCount(),
          ticketApi.getTickets()
        ]);

        setStats(statsResult);
        setResources(resourcesResult || []);
        setUnreadCount(unreadResult);
        setTickets(ticketsResult.data.data || []);
      } catch {
        toast.error('Failed to load dashboard analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!isAdmin()) return;
      try {
        setIsScheduleLoading(true);
        const data = await bookingApi.getDailySchedule(scheduleDate);
        setDailySchedule(data);
      } catch (error) {
        toast.error('Failed to fetch schedule for selected date');
      } finally {
        setIsScheduleLoading(false);
      }
    };
    fetchSchedule();
  }, [scheduleDate, isAdmin]);

  const chartData = useMemo(
    () =>
      Object.entries(stats.byType || {}).map(([type, count]) => ({
        type: formatLabel(type),
        count
      })),
    [stats.byType]
  );

  const recentResources = useMemo(() => {
    return [...resources]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [resources]);

  if (isLoading) {
    return <LoadingSpinner label="Loading dashboard overview..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Campus Insights</h1>
          <p className="text-slate-500 mt-1">Smart Campus Operations Hub Dashboard</p>
        </div>
        <div className="flex gap-3">
          {isAdmin() && (
            <Link
              to="/resources/new"
              className="rounded-xl bg-[#10B981] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
            >
              + Add Resource
            </Link>
          )}
          <Link
            to="/notifications"
            className="rounded-xl bg-[#1E3A5F] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
          >
            Notifications ({unreadCount})
          </Link>
        </div>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Facilities" value={stats.total} accent="#1E3A5F" icon={<DashboardIcon />} />
        <StatCard title="Ready to Use" value={stats.active} accent="#10B981" icon={<DashboardIcon />} />
        <StatCard title="Under Maintenance" value={stats.outOfService} accent="#EF4444" icon={<DashboardIcon />} />
        <StatCard title="Unread Alerts" value={unreadCount} accent="#3B82F6" icon={<DashboardIcon />} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#10B981] rounded-full"></span>
            Facility Distribution
          </h2>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" fill="#1E3A5F" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No resource data available.</div>
            )}
          </div>
        </section>

        {/* Availability Calendar / Daily Schedule (ADMIN ONLY) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
            Daily Schedule
          </h2>
          <p className="text-xs text-slate-500 mb-6 font-medium uppercase tracking-wider">Check availability before approval</p>
          
          <div className="mb-6">
            <input 
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
            />
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {isScheduleLoading ? (
              <div className="text-center py-10 text-slate-400 text-sm">Updating schedule...</div>
            ) : dailySchedule.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-400 text-sm">No bookings for this date.</p>
                <p className="text-[10px] text-slate-300 font-bold mt-1">ALL ROOMS AVAILABLE</p>
              </div>
            ) : (
              dailySchedule.map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800 text-xs truncate w-2/3">{item.resourceName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bookingStatusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter flex justify-between">
                    <span>⏰ {item.startTime} - {item.endTime}</span>
                    <span className="text-slate-400">{item.userId.split('@')[0]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {isAdmin() && (
            <Link to="/bookings" className="mt-6 block text-center py-3 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all">
              Manage Requests
            </Link>
          )}
        </section>
      </div>

      {/* Recent Resources */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
          Newly Added Facilities
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Wing</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{resource.name}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-medium">{formatLabel(resource.type)}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{resource.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full border px-4 py-1 text-xs font-bold ${statusStyles[resource.status]}`}>
                      {formatLabel(resource.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent Incident Tickets</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Issue</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Reporter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.slice(0, 5).length > 0 ? (
                tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      <Link to={`/tickets/${ticket.id}`} className="hover:text-blue-600">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-bold uppercase">{ticket.status}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-bold ${ticket.priority === 'URGENT' ? 'text-rose-600' : 'text-slate-600'}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{ticket.reporterName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 py-5 text-center text-slate-500">
                    No tickets reported yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
