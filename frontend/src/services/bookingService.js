import axiosInstance from './axiosInstance';

const getData = (response) => {
  const payload = response?.data;
  return payload?.data ?? payload;
};

export const getMyBookings = async ({ userId, status } = {}) => {
  const params = {
    ...(userId ? { userId } : {}),
    ...(status ? { status } : {})
  };

  const response = await axiosInstance.get('/api/bookings/my', { params });
  return getData(response) ?? [];
};

export const getAllBookings = async ({ userRole = 'ADMIN', status } = {}) => {
  const params = {
    userRole,
    ...(status ? { status } : {})
  };

  const response = await axiosInstance.get('/api/bookings', { params });
  return getData(response) ?? [];
};

export const createBooking = async (data, { userId } = {}) => {
  const response = await axiosInstance.post('/api/bookings', data, {
    params: userId ? { userId } : {}
  });
  return getData(response);
};

export const reviewBooking = async (id, data, { userRole = 'ADMIN', reviewerUserId } = {}) => {
  const response = await axiosInstance.put(`/api/bookings/${id}/review`, data, {
    params: {
      userRole,
      ...(reviewerUserId ? { reviewerUserId } : {})
    }
  });
  return getData(response);
};

export const cancelBooking = async (id, { userId, userRole } = {}) => {
  const response = await axiosInstance.put(`/api/bookings/${id}/cancel`, null, {
    params: {
      ...(userId ? { userId } : {}),
      ...(userRole ? { userRole } : {})
    }
  });
  return getData(response);
};

const bookingService = {
  getMyBookings,
  getAllBookings,
  createBooking,
  reviewBooking,
  cancelBooking
};

export default bookingService;
