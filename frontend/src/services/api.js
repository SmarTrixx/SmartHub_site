import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout')
};

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (projectId) => api.get(`/projects/${projectId}`),
  create: (formData) => api.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (projectId, formData) => api.put(`/projects/${projectId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (projectId) => api.delete(`/projects/${projectId}`)
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (formData) => api.put('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (serviceId) => api.get(`/services/${serviceId}`),
  create: (data) => api.post('/services', data),
  update: (serviceId, data) => api.put(`/services/${serviceId}`, data),
  delete: (serviceId) => api.delete(`/services/${serviceId}`)
};

export default api;
