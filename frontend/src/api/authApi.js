import axiosInstance from './axiosInstance';

const authApi = {
  login: async (email, password) => {
    return axiosInstance.post('/api/auth/login', { email, password });
  },

  signup: async (name, email, password) => {
    return axiosInstance.post('/api/auth/signup', { name, email, password });
  },

  googleAuth: async (idToken) => {
    return axiosInstance.post('/api/auth/google', { idToken });
  }
};

export default authApi;
