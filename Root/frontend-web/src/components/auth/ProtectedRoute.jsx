/**
 * ProtectedRoute - Bảo vệ các route yêu cầu đăng nhập
 * Requirements: 0.1, 0.3, 0.4, 0.5
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Hiển thị spinner trong khi kiểm tra auth state từ localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Chưa đăng nhập → redirect về /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
