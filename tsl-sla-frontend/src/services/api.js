import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response);
    return Promise.reject(
      error.response?.data?.message || 'An error occurred'
    );
  }
);

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const createSLA = async (slaData) => {
  const response = await api.post('/slas', slaData);
  return response.data;
};

export const getSLA = async (id) => {
  const response = await api.get(`/slas/${id}`);
  return response.data;
};

export const submitSLA = async (id) => {
  const response = await api.put(`/slas/${id}/submit`);
  return response.data;
};

export const reviewSLA = async (id, reviewData) => {
  const response = await api.post(`/slas/${id}/review`, reviewData);
  return response.data;
};

export const getUserSLAs = async (userId) => {
  const response = await api.get(`/slas/user/${userId}`);
  return response.data;
};

export const getDepartmentSLAs = async (deptName) => {
  const response = await api.get(`/slas/dept/${deptName}`);
  return response.data;
};

export const saveProgress = async (slaId, progressData) => {
  const response = await api.post(`/progress/${slaId}`, progressData);
  return response.data;
};

export const getProgress = async (slaId) => {
  const response = await api.get(`/progress/${slaId}`);
  return response.data;
};

export const addComment = async (slaId, commentData) => {
  const response = await api.post(`/comments/${slaId}`, commentData);
  return response.data;
};

export const getComments = async (slaId) => {
  const response = await api.get(`/comments/${slaId}`);
  return response.data;
};

export default api;