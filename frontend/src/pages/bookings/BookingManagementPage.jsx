import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import bookingService from '../../services/bookingService';
import resourceService from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const statusStyles = {
  PENDING: 'bg-[#F59E0B]/20 text-[#92400E]',
  APPROVED: 'bg-[#10B981]/20 text-[#047857]',
  REJECTED: 'bg-[#EF4444]/20 text-[#B91C1C]',
  CANCELLED: 'bg-[#64748B]/20 text-[#334155]'
};

const initialFormState = {
  resourceId: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: ''
};

const formatLabel = (value) =>
  (value || '')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

function BookingManagementPage() {
  const { user, isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = user?.email || 'user123';
  const role = user?.role || 'USER';

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};

      const data = isAdmin()
        ? await bookingService.getAllBookings({ ...params, userRole: role })
        : await bookingService.getMyBookings({ ...params, userId });

      setBookings(data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to load bookings';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, role, statusFilter, userId]);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await resourceService.getAllResources({ status: 'ACTIVE' });
        setResources(data || []);
      } catch {
        toast.error('Failed to load resources for booking');
      }
    };

    loadResources();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const mappedBookings = useMemo(
    () =>
      bookings.map((booking) => ({
        ...booking,
        statusLabel: formatLabel(booking.status)
      })),
    [bookings]
  );

  const handleCreateBooking = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const payload = {
        resourceId: form.resourceId,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : undefined
      };

      await bookingService.createBooking(payload, { userId });
      toast.success('Booking request submitted');
      setForm(initialFormState);
      await loadBookings();
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create booking';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await bookingService.reviewBooking(id, { status: 'APPROVED' }, { userRole: role, reviewerUserId: userId });
      toast.success('Booking approved');
      await loadBookings();
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to approve booking';
      toast.error(message);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason || !reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await bookingService.reviewBooking(
        id,
        { status: 'REJECTED', reason: reason.trim() },
        { userRole: role, reviewerUserId: userId }
      );
      toast.success('Booking rejected');
      await loadBookings();
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to reject booking';
      toast.error(message);
    }
  };

  const handleCancel = async (id) => {
    try {
      await bookingService.cancelBooking(id, { userId, userRole: role });
      toast.success('Booking cancelled');
      await loadBookings();
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to cancel booking';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Booking Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Submit booking requests and track workflow status (PENDING, APPROVED, REJECTED, CANCELLED).
        </p>

        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCreateBooking}>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Resource</span>
            <select
              value={form.resourceId}
              onChange={(event) => setForm((prev) => ({ ...prev, resourceId: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            >
              <option value="">Select resource</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Booking Date</span>
            <input
              type="date"
              value={form.bookingDate}
              onChange={(event) => setForm((prev) => ({ ...prev, bookingDate: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Start Time</span>
            <input
              type="time"
              value={form.startTime}
              onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">End Time</span>
            <input
              type="time"
              value={form.endTime}
              onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Purpose</span>
            <input
              type="text"
              value={form.purpose}
              onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Workshop, group meeting, presentation..."
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Expected Attendees</span>
            <input
              type="number"
              min="1"
              value={form.expectedAttendees}
              onChange={(event) => setForm((prev) => ({ ...prev, expectedAttendees: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Optional"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{isAdmin() ? 'All Bookings' : 'My Bookings'}</h2>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="py-8 text-sm text-slate-500">Loading bookings...</p>
        ) : mappedBookings.length === 0 ? (
          <p className="py-8 text-sm text-slate-500">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-3 py-2 font-medium">Resource</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Requested By</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mappedBookings.map((booking) => {
                  const canReview = isAdmin() && booking.status === 'PENDING';
                  const canCancel =
                    booking.status === 'APPROVED' && (isAdmin() || booking.userId === userId);

                  return (
                    <tr key={booking.id}>
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-800">{booking.resourceName}</p>
                        <p className="text-xs text-slate-500">{booking.purpose}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{booking.bookingDate}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {booking.startTime} - {booking.endTime}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{booking.userId}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[booking.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {booking.statusLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {canReview && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(booking.id)}
                                className="rounded-md bg-[#10B981] px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(booking.id)}
                                className="rounded-md bg-[#EF4444] px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => handleCancel(booking.id)}
                              className="rounded-md bg-[#334155] px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default BookingManagementPage;
