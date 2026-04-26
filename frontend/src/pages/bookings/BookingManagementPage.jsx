import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import bookingService from '../../services/bookingService';
import resourceService from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useLocation } from 'react-router-dom';

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function BookingManagementPage() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const isTeacher = user?.role === 'TEACHER';
  
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Availability check state
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  
  const [formData, setFormData] = useState({
    resourceId: location.state?.preselectedResourceId || '',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '1'
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [bookingsData, resourcesData] = await Promise.all([
        isAdmin() ? bookingService.getAllBookings() : bookingService.getMyBookings(),
        resourceService.getAllResources({ status: 'ACTIVE' })
      ]);
      setBookings(bookingsData);
      setResources(resourcesData);
    } catch (error) {
      toast.error('Failed to load booking data');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live Availability Check
  useEffect(() => {
    const checkRoomAvailability = async () => {
      if (!formData.resourceId || !formData.bookingDate) {
        setRoomSchedule([]);
        return;
      }
      try {
        setIsCheckingAvailability(true);
        // We'll add this method to the service in a moment
        const response = await bookingService.getDailySchedule(formData.bookingDate);
        const filtered = response.filter(b => b.resourceId === formData.resourceId);
        setRoomSchedule(filtered);
      } catch (err) {
        console.error('Availability check failed');
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkRoomAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.resourceId, formData.bookingDate]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bookingService.createBooking({
        ...formData,
        expectedAttendees: Number(formData.expectedAttendees) || 1
      });
      toast.success('Booking request sent to Admin');
      setFormData({ ...formData, resourceId: '', purpose: '', expectedAttendees: '1' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Conflict detected or invalid data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (id, status) => {
    let reason = '';
    if (status === 'REJECTED') {
      reason = window.prompt('Please enter a reason for rejection:');
      if (!reason) return;
    }

    try {
      await bookingService.reviewBooking(id, { status, reason });
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  if (isLoading) return <LoadingSpinner label="Fetching campus schedule..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Management</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin() ? 'Review and manage all campus facility requests' : 'Request classrooms and track your approval status'}
          </p>
        </div>
      </div>

      {/* Teacher's Request Form */}
      {isTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#1E3A5F] rounded-full"></span>
              Request a Classroom / Facility
            </h2>
            <form onSubmit={handleCreateBooking} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Resource / Room</label>
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F] transition-all"
                  value={formData.resourceId}
                  onChange={e => setFormData({ ...formData, resourceId: e.target.value })}
                >
                  <option value="">Select a Classroom</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F] transition-all"
                  value={formData.bookingDate}
                  onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Start Time</label>
                <input
                  type="time"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F] transition-all"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">End Time</label>
                <input
                  type="time"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F] transition-all"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Expected Attendees (Min 1)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F] transition-all"
                  value={formData.expectedAttendees}
                  onChange={e => setFormData({ ...formData, expectedAttendees: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Purpose / Lecture Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F] transition-all"
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g. Data Structures Lecture"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  disabled={isSubmitting}
                  className="bg-[#1E3A5F] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Requesting...' : 'Confirm Booking Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Availability Side-Panel */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>Occupancy Check</span>
              {isCheckingAvailability && <span className="text-[10px] animate-pulse text-blue-600">Syncing...</span>}
            </h3>
            {formData.resourceId ? (
              <div className="space-y-3">
                {roomSchedule.length === 0 ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                    <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider italic">Fully Available</p>
                    <p className="text-[10px] text-emerald-600 mt-1">No bookings for this date yet.</p>
                  </div>
                ) : (
                  roomSchedule.map(slot => (
                    <div key={slot.id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">{slot.startTime} - {slot.endTime}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${statusStyles[slot.status]}`}>
                          {slot.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{slot.purpose}</p>
                    </div>
                  ))
                )}
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                  Avoid requesting overlapping slots to ensure Admin approval.
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic text-center py-10">Select a classroom to check its availability schedule.</p>
            )}
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center gap-2 px-2">
          <span className="w-1.5 h-1.5 bg-[#1E3A5F] rounded-full"></span>
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest">{isAdmin() ? 'Review All Requests' : 'My Requests Status'}</h2>
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-400">No booking records found.</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1E3A5F]/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#1E3A5F]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m0 10V4m-4 6h4m-4 4h4" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{booking.resourceName}</h3>
                  <p className="text-sm text-slate-500 font-medium">{booking.purpose}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <span>📅 {booking.bookingDate}</span>
                    <span>⏰ {booking.startTime} - {booking.endTime}</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-500 border border-slate-200">ID: {booking.userId.split('@')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statusStyles[booking.status]}`}>
                  {booking.status}
                </span>
                
                <div className="flex gap-2">
                  {isAdmin() && booking.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleReview(booking.id, 'APPROVED')}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReview(booking.id, 'REJECTED')}
                        className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'APPROVED' && (
                    <button 
                      onClick={() => toast.success('Booking is already confirmed')}
                      className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-xs font-bold cursor-default border border-emerald-100"
                    >
                      ✓ Finalized
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
