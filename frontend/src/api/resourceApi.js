import axiosInstance from './axiosInstance';

const getData = (response) => {
  const payload = response?.data;
  return payload?.data ?? payload;
};

export const getAllResources = async (params = {}) => {
  const response = await axiosInstance.get('/api/resources', { params });
  return getData(response);
};

export const getResourceById = async (id) => {
  const response = await axiosInstance.get(`/api/resources/${id}`);
  return getData(response);
};

export const createResource = async (data) => {
  const response = await axiosInstance.post('/api/resources', data);
  return getData(response);
};

export const updateResource = async (id, data) => {
  const response = await axiosInstance.put(`/api/resources/${id}`, data);
  return getData(response);
};

export const deleteResource = async (id) => {
  await axiosInstance.delete(`/api/resources/${id}`);
};

export const searchResources = async (filters = {}) => {
  const { search = '', ...queryFilters } = filters;
  const queryParams = Object.fromEntries(
    Object.entries(queryFilters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );

  const response = await axiosInstance.get('/api/resources/search', { params: queryParams });
  const resources = getData(response) ?? [];

  if (!search.trim()) {
    return resources;
  }

  const normalizedSearch = search.trim().toLowerCase();

  return resources.filter((resource) => {
    const fields = [resource.name, resource.location, resource.description].filter(Boolean);
    return fields.some((value) => value.toLowerCase().includes(normalizedSearch));
  });
};

const resourceApi = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  searchResources
};

export default resourceApi;
