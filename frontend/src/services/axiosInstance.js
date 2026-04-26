import axios from 'axios';

 adrian-dev
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
 main
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart-campus-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('smart-campus-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
