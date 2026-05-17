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
import BCNManagementPage from "./pages/BCNManagementPage";
import FacultyManagementPage from "./pages/FacultyManagementPage";
import StudentAffairsPage from "./pages/StudentAffairsPage";
import ProfilePage from "./pages/ProfilePage";
import ClubsPage from "./pages/ClubsPage";
import ClubDetailPage from "./pages/ClubDetailPage";

/**
 * App - Root component
 * Thiết lập React Router, AuthProvider và AppProvider cho toàn bộ ứng dụng.
 *
 * Phân quyền route:
 * - /                          → SV, BCN, KHOA, CTSV (tất cả đã đăng nhập)
 * - /events/:id                → tất cả
 * - /events/:id/qr             → tất cả
 * - /my-events                 → SV (sinh viên)
 * - /bcn-management            → BCN (ban chủ nhiệm CLB)
 * - /faculty-management        → KHOA (cán bộ khoa)
 * - /student-affairs           → CTSV (phòng công tác sinh viên)
 */

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
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/clubs" element={<ClubsPage />} />
                  <Route path="/clubs/:id" element={<ClubDetailPage />} />
                </Route>

                {/* Chỉ Ban chủ nhiệm CLB */}
                <Route element={<ProtectedRoute roles={["BCN"]} />}>
                  <Route
                    path="/bcn-management"
                    element={<BCNManagementPage />}
                  />
                </Route>

                {/* Chỉ Cán bộ Khoa */}
                <Route element={<ProtectedRoute roles={["KHOA"]} />}>
                  <Route
                    path="/faculty-management"
                    element={<FacultyManagementPage />}
                  />
                </Route>

                {/* Chỉ Phòng CTSV */}
                <Route element={<ProtectedRoute roles={["CTSV"]} />}>
                  <Route
                    path="/student-affairs"
                    element={<StudentAffairsPage />}
                  />
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
