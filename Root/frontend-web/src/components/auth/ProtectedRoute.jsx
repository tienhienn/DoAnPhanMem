/**
 * ProtectedRoute - Bảo vệ các route yêu cầu đăng nhập và/hoặc role cụ thể.
 *
 * Props:
 * - roles: string[] (tùy chọn) — danh sách role được phép truy cập.
 *   Nếu không truyền, chỉ kiểm tra đăng nhập.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

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

  // Kiểm tra role nếu được chỉ định
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // Đã đăng nhập nhưng không đủ quyền → về trang chủ của role đó
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
