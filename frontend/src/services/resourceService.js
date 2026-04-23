import axiosInstance from '../api/axiosInstance';

const unwrapResponse = (response) => response?.data?.data;

export const getAllResources = async (params = {}) => {
  const response = await axiosInstance.get('/api/resources', { params });
  return unwrapResponse(response) || [];
};

export const getResourceById = async (id) => {
  const response = await axiosInstance.get(`/api/resources/${id}`);
  return unwrapResponse(response);
};

export const createResource = async (data) => {
  const response = await axiosInstance.post('/api/resources', data);
  return unwrapResponse(response);
};

export const updateResource = async (id, data) => {
  const response = await axiosInstance.put(`/api/resources/${id}`, data);
  return unwrapResponse(response);
};

export const deleteResource = async (id) => {
  await axiosInstance.delete(`/api/resources/${id}`);
};
