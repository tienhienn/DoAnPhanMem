/**
 * App - Root component
 * Thiết lập React Router và AppProvider cho toàn bộ ứng dụng
 * Requirements: 7.4
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import EventListPage from "./pages/EventListPage";
import EventDetailPage from "./pages/EventDetailPage";
import QRScreen from "./pages/QRScreen";
import MyEventsPage from "./pages/MyEventsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/qr" element={<QRScreen />} />
            <Route path="/my-events" element={<MyEventsPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
