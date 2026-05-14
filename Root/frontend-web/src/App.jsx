/**
 * App - Root component
 * Thiết lập React Router, AuthProvider và AppProvider cho toàn bộ ứng dụng
 * Requirements: 0.4, 0.5, 0.6, 0.7
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
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<EventListPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/events/:id/qr" element={<QRScreen />} />
                <Route path="/my-events" element={<MyEventsPage />} />
                <Route path="/event-management" element={<EventManagementPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
