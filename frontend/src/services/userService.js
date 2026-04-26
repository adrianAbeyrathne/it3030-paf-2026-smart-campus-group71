import axiosInstance from './axiosInstance';

const getData = (response) => {
  const payload = response?.data;
  return payload?.data ?? payload;
};

/** Fetch all users (Admin only) */
export const getAllUsers = async () => {
  const response = await axiosInstance.get('/api/users');
  return getData(response) ?? [];
};

/** Get current logged in user profile */
export const getMyProfile = async () => {
  const response = await axiosInstance.get('/api/users/me');
  return getData(response);
};

/** Update a user's role (Admin only) */
export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.put(`/api/users/${userId}/role`, { role });
  return getData(response);
};

const userService = {
  getAllUsers,
  getMyProfile,
  updateUserRole
};

export default userService;
