/**
 * App - Root component
 * Thiết lập React Router, AuthProvider và AppProvider cho toàn bộ ứng dụng.
 *
 * Phân quyền route:
 * - /                    → SV, BCN, KHOA, CTSV (tất cả đã đăng nhập)
 * - /events/:id          → tất cả
 * - /events/:id/qr       → tất cả
 * - /my-events           → SV (sinh viên)
 * - /event-management    → BCN, KHOA, CTSV
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import EventListPage from "./pages/EventListPage";
import EventDetailPage from "./pages/EventDetailPage";
import QRScreen from "./pages/QRScreen";
import MyEventsPage from "./pages/MyEventsPage";
import EventManagementPage from "./pages/EventManagementPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — tất cả role đã đăng nhập */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<EventListPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/events/:id/qr" element={<QRScreen />} />

                {/* Chỉ sinh viên */}
                <Route element={<ProtectedRoute roles={["SV"]} />}>
                  <Route path="/my-events" element={<MyEventsPage />} />
                </Route>

                {/* Chỉ BCN, KHOA, CTSV */}
                <Route element={<ProtectedRoute roles={["BCN", "KHOA", "CTSV"]} />}>
                  <Route path="/event-management" element={<EventManagementPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
