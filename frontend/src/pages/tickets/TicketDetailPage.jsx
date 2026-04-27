import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ticketApi from '../../api/ticketApi';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);

  const isAdminOrTech = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
  const isAdmin = user?.role === 'ADMIN';


  const fetchTechnicians = useCallback(async () => {
    try {
      const data = await userApi.getUsersByRole('TECHNICIAN');
      setTechnicians(data);
    } catch (err) {
      console.error('Failed to load technicians');
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        ticketApi.getTicketById(id),
        ticketApi.getComments(id)
      ]);
      setTicket(ticketRes.data.data);
      setComments(commentsRes.data.data);
    } catch (err) {
      toast.error('Failed to load ticket details');
      navigate('/tickets');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
    if (isAdmin) {
      fetchTechnicians();
    }
  }, [fetchData, fetchTechnicians, isAdmin]);

  const handleStatusUpdate = async (newStatus, notes = '') => {
    setIsActionLoading(true);
    try {
      await ticketApi.updateStatus(id, { status: newStatus, resolutionNotes: notes });
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAssignTechnician = async (techId) => {
    if (!techId) return;
    setIsActionLoading(true);
    try {
      await ticketApi.updateStatus(id, { assignedToId: techId });
      toast.success('Technician assigned successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to assign technician');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await ticketApi.addComment(id, newComment);
      setNewComment('');
      const res = await ticketApi.getComments(id);
      setComments(res.data.data);
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Ticket Info */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  ticket.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {ticket.priority} Priority
                </span>
                <span className="text-slate-400 font-mono text-sm">#{ticket.id.slice(-6)}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">{ticket.title}</h1>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
              ticket.status === 'RESOLVED' ? 'bg-emerald-500 text-white' : 
              ticket.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              {ticket.status}
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>

            {ticket.images && ticket.images.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Attachments</h3>
                <div className="flex gap-4">
                  {ticket.images.map((img, idx) => (
                    <a 
                      key={idx} 
                      href={`http://localhost:8888/uploads/tickets/${img}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src={`http://localhost:8888/uploads/tickets/${img}`} 
                        alt="attachment" 
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {ticket.resolutionNotes && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-1">Resolution Notes</h3>
                <p className="text-emerald-700">{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Communication Thread</h2>
          </div>
          <div className="p-6 space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className={`flex flex-col ${comment.userId === user.id ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  comment.userId === user.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="text-xs font-bold mb-1 opacity-70">{comment.userName}</p>
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-[10px] mt-2 opacity-50">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}

            <form onSubmit={handleAddComment} className="mt-8 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-blue-900 transition-all"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column: Metadata & Actions */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Ticket Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Category</span>
              <span className="text-slate-800 text-sm font-semibold">{ticket.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Location</span>
              <span className="text-slate-800 text-sm font-semibold">{ticket.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Reporter</span>
              <span className="text-slate-800 text-sm font-semibold">{ticket.reporterName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Assigned To</span>
              <span className="text-slate-800 text-sm font-semibold">{ticket.assignedToName}</span>
            </div>
          </div>
        </div>

        {isAdmin && ticket.status !== 'CLOSED' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Assign Personnel</h3>
            <div className="flex gap-3">
              <select 
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={ticket.assignedToId || ''}
                onChange={(e) => handleAssignTechnician(e.target.value)}
                disabled={isActionLoading}
              >
                <option value="">Unassigned</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name} (Technician)</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isAdminOrTech && ticket.status !== 'CLOSED' && (
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Service Operations</h3>
            <div className="grid grid-cols-1 gap-3">
              {ticket.status === 'OPEN' && (
                <button
                  onClick={() => handleStatusUpdate('IN_PROGRESS')}
                  disabled={isActionLoading}
                  className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all"
                >
                  Start Work
                </button>
              )}
              {ticket.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => {
                    const notes = prompt('Enter resolution notes:');
                    if (notes) handleStatusUpdate('RESOLVED', notes);
                  }}
                  disabled={isActionLoading}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all"
                >
                  Mark as Resolved
                </button>
              )}
              {ticket.status !== 'REJECTED' && ticket.status !== 'RESOLVED' && (
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) handleStatusUpdate('REJECTED', reason);
                  }}
                  disabled={isActionLoading}
                  className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all"
                >
                  Reject Ticket
                </button>
              )}
              {ticket.status === 'RESOLVED' && (
                <button
                  onClick={() => handleStatusUpdate('CLOSED')}
                  disabled={isActionLoading}
                  className="w-full py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
                >
                  Close Permanently
                </button>
              )}
            </div>
          </div>
        )}

        {!isAdminOrTech && ticket.status === 'RESOLVED' && (
           <div className="bg-emerald-500 p-6 rounded-2xl shadow-xl text-white">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Issue Fixed!</h3>
             <p className="text-xs opacity-90 mb-4">The technician has resolved this issue. If you are satisfied, the ticket will be closed.</p>
             <button
               onClick={() => handleStatusUpdate('CLOSED')}
               className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
             >
               Confirm & Close
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
