import axiosInstance from './axiosInstance';

const getData = (response) => {
  const payload = response?.data;
  return payload?.data ?? payload;
};

/** Get current user's bookings */
export const getMyBookings = async ({ status } = {}) => {
  const params = {
    ...(status ? { status } : {})
  };
  const response = await axiosInstance.get('/api/bookings/my', { params });
  return getData(response) ?? [];
};

/** Get all bookings (Admin only) */
export const getAllBookings = async ({ status } = {}) => {
  const params = {
    ...(status ? { status } : {})
  };
  const response = await axiosInstance.get('/api/bookings', { params });
  return getData(response) ?? [];
};

/** Get daily schedule for a date (Admin only) */
export const getDailySchedule = async (date) => {
  const response = await axiosInstance.get('/api/bookings/schedule', { params: { date } });
  return getData(response) ?? [];
};

/** Create a new booking request (Teacher only) */
export const createBooking = async (data) => {
  const response = await axiosInstance.post('/api/bookings', data);
  return getData(response);
};

/** Approve or Reject a booking (Admin only) */
export const reviewBooking = async (id, data) => {
  const response = await axiosInstance.put(`/api/bookings/${id}/review`, data);
  return getData(response);
};

/** Cancel an approved booking */
export const cancelBooking = async (id) => {
  const response = await axiosInstance.put(`/api/bookings/${id}/cancel`, null);
  return getData(response);
};

const bookingService = {
  getMyBookings,
  getAllBookings,
  getDailySchedule,
  createBooking,
  reviewBooking,
  cancelBooking
};

export default bookingService;
