import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
// Strip trailing slash if present
rawUrl = rawUrl.replace(/\/+$/, '');
// Ensure it ends with /api
const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
