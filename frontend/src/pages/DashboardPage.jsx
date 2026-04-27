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
import resourceService from '../services/resourceService';
import notificationService from '../services/notificationService';
import statsService from '../services/statsService';
import TicketService from '../services/TicketService';

const formatLabel = (value) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const statusStyles = {
  ACTIVE: 'bg-[#10B981]/15 text-[#047857] border-[#10B981]/30',
  OUT_OF_SERVICE: 'bg-[#EF4444]/15 text-[#B91C1C] border-[#EF4444]/30'
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
  const [stats, setStats] = useState({ total: 0, active: 0, outOfService: 0, byType: {} });
  const [unreadCount, setUnreadCount] = useState(0);
  const [resources, setResources] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [statsResult, resourcesResult, unreadResult, ticketsResult] = await Promise.all([
          statsService.getResourceStats(),
          resourceService.getAllResources(),
          notificationService.getUnreadCount(),
          TicketService.getTickets()
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Link
            to="/resources/new"
            className="rounded-md bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            + Add Resource
          </Link>
          <Link
            to="/notifications"
            className="rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            View All Notifications
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Resources" value={stats.total} accent="#1E3A5F" icon={<DashboardIcon />} />
        <StatCard title="Active Resources" value={stats.active} accent="#10B981" icon={<DashboardIcon />} />
        <StatCard title="Out of Service" value={stats.outOfService} accent="#EF4444" icon={<DashboardIcon />} />
        <StatCard title="Total Notifications" value={unreadCount} accent="#3B82F6" icon={<DashboardIcon />} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Resource Types Breakdown</h2>
        <div className="mt-4 h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1E3A5F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No resource type data available.</div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent Resources</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentResources.length > 0 ? (
                recentResources.map((resource) => (
                  <tr key={resource.id}>
                    <td className="px-3 py-2 font-medium text-slate-800">{resource.name}</td>
                    <td className="px-3 py-2 text-slate-600">{formatLabel(resource.type)}</td>
                    <td className="px-3 py-2 text-slate-600">{resource.location}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusStyles[resource.status] || 'border-slate-300 bg-slate-100 text-slate-700'
                        }`}
                      >
                        {formatLabel(resource.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 py-5 text-center text-slate-500">
                    No resources available.
                  </td>
                </tr>
              )}
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
