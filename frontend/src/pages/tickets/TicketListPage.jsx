import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ticketApi from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'assigned'
  const isAdminOrTech = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
  const isTech = user?.role === 'TECHNICIAN';


  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = activeTab === 'assigned' 
        ? await ticketApi.getAssignedTickets()
        : await ticketApi.getTickets();
      setTickets(res.data.data);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700';
      case 'CLOSED': return 'bg-slate-100 text-slate-700';
      case 'REJECTED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Support Tickets</h1>
          <p className="text-slate-600">{isAdminOrTech ? 'Manage all campus incidents' : 'Track your reported issues'}</p>
        </div>
        <Link
          to="/tickets/raise"
          className="px-6 py-3 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-blue-900 transition-all shadow-md shadow-blue-100"
        >
          Raise New Ticket
        </Link>
      </div>

      {isTech && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'all' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'assigned' ? 'bg-[#1E3A5F] text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Assigned to Me
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">No tickets found.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className="text-xs text-slate-400">#{ticket.id.slice(-6)}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{ticket.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{ticket.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>📍 {ticket.location}</span>
                  <span>👤 {ticket.reporterName}</span>
                  <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <div className={`text-sm font-bold ${ticket.priority === 'URGENT' ? 'text-rose-600' : 'text-slate-600'}`}>
                  {ticket.priority} PRIORITY
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Last updated {new Date(ticket.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-slate-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
