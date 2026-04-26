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

  // ---------------------------
  // FETCH DATA (FIXED)
  // ---------------------------
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [bookingsData, resourcesData] = await Promise.all([
        isAdmin()
          ? bookingService.getAllBookings()
          : bookingService.getMyBookings(),
        resourceService.getAllResources({ status: 'ACTIVE' })
      ]);

      setBookings(bookingsData || []);
      setResources(resourcesData || []);
    } catch (error) {
      toast.error('Failed to load booking data');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------
  // LIVE AVAILABILITY CHECK
  // ---------------------------
  useEffect(() => {
    const checkRoomAvailability = async () => {
      if (!formData.resourceId || !formData.bookingDate) {
        setRoomSchedule([]);
        return;
      }

      try {
        setIsCheckingAvailability(true);

        const response = await bookingService.getDailySchedule(
          formData.bookingDate
        );

        const filtered = (response || []).filter(
          b => b.resourceId === formData.resourceId
        );

        setRoomSchedule(filtered);
      } catch (err) {
        console.error('Availability check failed', err);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkRoomAvailability, 400);
    return () => clearTimeout(timeoutId);
  }, [formData.resourceId, formData.bookingDate]);

  // ---------------------------
  // CREATE BOOKING
  // ---------------------------
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await bookingService.createBooking({
        ...formData,
        expectedAttendees: Number(formData.expectedAttendees) || 1
      });

      toast.success('Booking request sent successfully');

      setFormData({
        ...formData,
        resourceId: '',
        purpose: '',
        expectedAttendees: '1',
        startTime: '',
        endTime: ''
      });

      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------
  // ADMIN REVIEW
  // ---------------------------
  const handleReview = async (id, status) => {
    let reason = '';

    if (status === 'REJECTED') {
      reason = window.prompt('Enter rejection reason:');
      if (!reason) return;
    }

    try {
      await bookingService.reviewBooking(id, { status, reason });
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchData();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading bookings..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Booking Management
        </h1>
        <p className="text-slate-500 mt-1">
          {isAdmin()
            ? 'Manage all facility bookings'
            : 'Request and track your bookings'}
        </p>
      </div>

      {/* FORM SECTION */}
      {isTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORM */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-8">

            <h2 className="text-lg font-bold mb-6">
              Request Facility
            </h2>

            <form onSubmit={handleCreateBooking} className="grid gap-4">

              <select
                value={formData.resourceId}
                onChange={(e) =>
                  setFormData({ ...formData, resourceId: e.target.value })
                }
                required
              >
                <option value="">Select Resource</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={formData.bookingDate}
                onChange={(e) =>
                  setFormData({ ...formData, bookingDate: e.target.value })
                }
                required
              />

              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />

              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Purpose"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                required
              />

              <button disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Booking'}
              </button>

            </form>
          </div>

          {/* AVAILABILITY */}
          <div className="bg-slate-50 p-6 rounded-xl border">
            <h3 className="font-bold mb-4">
              Availability
              {isCheckingAvailability && (
                <span className="text-xs ml-2 text-blue-500">checking...</span>
              )}
            </h3>

            {roomSchedule.length === 0 ? (
              <p className="text-sm text-green-600">
                Fully available
              </p>
            ) : (
              roomSchedule.map((s) => (
                <div key={s.id} className="p-2 border rounded mb-2">
                  <div className="text-xs font-bold">
                    {s.startTime} - {s.endTime}
                  </div>
                  <div className="text-xs">{s.status}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS LIST */}
      <div className="space-y-4">

        <h2 className="font-bold">
          {isAdmin() ? 'All Bookings' : 'My Bookings'}
        </h2>

        {bookings.map((b) => (
          <div key={b.id} className="border p-4 rounded flex justify-between">

            <div>
              <div className="font-bold">{b.resourceName}</div>
              <div className="text-sm text-gray-500">{b.purpose}</div>
            </div>

            <div className="flex gap-2 items-center">

              <span className={statusStyles[b.status]}>
                {b.status}
              </span>

              {isAdmin() && b.status === 'PENDING' && (
                <>
                  <button onClick={() => handleReview(b.id, 'APPROVED')}>
                    Approve
                  </button>
                  <button onClick={() => handleReview(b.id, 'REJECTED')}>
                    Reject
                  </button>
                </>
              )}

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}