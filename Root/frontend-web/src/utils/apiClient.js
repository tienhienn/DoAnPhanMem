/**
 * apiClient - Axios instance với interceptors cho auth
 * Requirements: 0.7, 0.8, 0.9
 */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Request interceptor: gắn Authorization header nếu có token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: xử lý 401 hoặc 404 ở endpoint /api/students/me (phiên đăng nhập hết hạn hoặc bị xóa)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isProfileUrl = error.config?.url?.includes('/api/students/me');
    if (status === 401 || (status === 404 && isProfileUrl)) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
