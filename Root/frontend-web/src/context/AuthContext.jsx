/* eslint-disable react-refresh/only-export-components */
/**
 * AuthContext - Quản lý xác thực người dùng
 * Requirements: 0.2, 0.7, 0.8, 0.9
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';

export const AuthContext = createContext(null);

/**
 * Giải mã JWT payload từ token string.
 * @param {string} token
 * @returns {{ maSV: string, hoTen: string, email: string, role?: string, exp: number } | null}
 */
function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch {
    return null;
  }
}

/**
 * AuthProvider - Provider bao bọc ứng dụng để cung cấp auth state.
 *
 * State shape:
 * - user: { maSV, hoTen, email } | null
 * - token: string | null
 * - isLoading: boolean
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Khôi phục session từ localStorage khi tải lại trang
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const payload = parseJwt(savedToken);
      if (payload && payload.exp * 1000 > Date.now()) {
        // LƯU: payload có thể chứa role => gắn vào user
        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        setUser({ maSV: payload.maSV, hoTen: payload.hoTen, email: payload.email, role: payload.role });
        setToken(savedToken);
      } else {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Đăng nhập với email và password.
   * Gọi POST /api/auth/login, lưu token, cập nhật state, navigate về trang chủ.
   *
   * @param {string} email
   * @param {string} password
   * @throws {AxiosError} Nếu đăng nhập thất bại
   */
  async function login(email, password) {
    const response = await apiClient.post('/api/auth/login', { email, password });
    const { token: newToken, maSV, hoTen, email: userEmail, role } = response.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // LƯU: lưu role vào user để các component có thể kiểm tra quyền
    setUser({ maSV, hoTen, email: userEmail, role });
    navigate('/');
  }

  /**
   * Đăng xuất: xóa token, reset state, navigate về trang login.
   */
  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook tiện ích để sử dụng AuthContext.
 * Phải được dùng bên trong AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return context;
}
