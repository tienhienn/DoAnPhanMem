/**
 * MyEventsPage - Trang "Sự Kiện Của Tôi"
 * Hiển thị danh sách sự kiện mà sinh viên đã đăng ký
 *
 * Requirements: 7.1, 7.2, 7.3
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Badge from "../components/ui/Badge";

/**
 * Format ngày giờ sang tiếng Việt ngắn gọn
 * Ví dụ: "Thứ Hai, 15 tháng 9, 2025 lúc 08:00"
 */
function formatDateTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyEventsPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMyEvents() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/api/students/me/events");
        if (!cancelled) {
          setEvents(response.data.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error?.message ||
              "Không thể tải danh sách sự kiện đã đăng ký"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchMyEvents();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-xl font-bold text-slate-900">Sự Kiện Của Tôi</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
                role="status"
                aria-label="Đang tải..."
              />
              <p className="text-sm text-slate-500">Đang tải sự kiện của bạn...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            role="alert"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-700 mb-1">
              Không thể tải sự kiện
            </p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          events.length === 0 ? (
            <EmptyState onExplore={() => navigate("/")} />
          ) : (
            <ul className="space-y-3" aria-label="Danh sách sự kiện đã đăng ký">
              {events.map((event) => {
                const maSK = event.maSK.trim();
                return (
                  <EventItem
                    key={maSK}
                    event={event}
                    onViewDetail={() => navigate(`/events/${maSK}`)}
                    onViewQR={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${maSK}/qr`);
                    }}
                  />
                );
              })}
            </ul>
          )
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * EventItem - Một item trong danh sách sự kiện đã đăng ký
 *
 * Hiển thị: colored dot, tên sự kiện, tên CLB, ngày giờ, badge trạng thái, nút QR
 */
function EventItem({ event, onViewDetail, onViewQR }) {
  const tenSK = event.tenSK;
  const tenCLB = event.tenCLB;
  const thoiGianBatDau = event.thoiGianBatDau;
  const trangThaiDangKy = event.trangThaiDangKy;

  return (
    <li>
      <button
        type="button"
        onClick={onViewDetail}
        className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={`Xem chi tiết sự kiện ${tenSK}`}
      >
        <div className="flex items-stretch gap-0">
          {/* Colored dot / accent bar thay cho thumbnail */}
          <div
            className="shrink-0 w-2 bg-gradient-to-b from-indigo-500 to-blue-600"
            aria-hidden="true"
          />

          {/* Nội dung */}
          <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between gap-2">
            <div className="space-y-1">
              {/* Tên câu lạc bộ */}
              <p className="text-xs font-medium text-indigo-600 truncate">
                {tenCLB}
              </p>

              {/* Tên sự kiện */}
              <h2 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                {tenSK}
              </h2>

              {/* Ngày giờ */}
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <CalendarIcon />
                <span className="truncate">{formatDateTime(thoiGianBatDau)}</span>
              </p>
            </div>

            {/* Badge trạng thái + nút QR */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <StatusBadge trangThaiDangKy={trangThaiDangKy} />
                {event.diemRenLuyen && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    ⭐ +{event.diemRenLuyen} ĐRL
                  </span>
                )}
              </div>

              {/* Nút Xem Mã QR */}
              <button
                type="button"
                onClick={onViewQR}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors border border-indigo-100"
                aria-label={`Xem mã QR sự kiện ${tenSK}`}
              >
                <QRIcon />
                Xem Mã QR
              </button>
            </div>
          </div>
        </div>
      </button>
    </li>
  );
}

/**
 * StatusBadge - Badge trạng thái đăng ký dựa trên trangThaiDangKy từ API
 * "da_diem_danh" → Badge type="attended" text "Đã điểm danh"
 * còn lại → Badge type="registered" text "Đã đăng ký"
 */
function StatusBadge({ trangThaiDangKy }) {
  if (trangThaiDangKy === "da_diem_danh") {
    return <Badge type="attended">Đã điểm danh</Badge>;
  }
  return <Badge type="registered">Đã đăng ký</Badge>;
}

/**
 * EmptyState - Hiển thị khi chưa đăng ký sự kiện nào
 */
function EmptyState({ onExplore }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {/* Icon bookmark */}
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <BookmarkIcon />
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-2">
        Bạn chưa đăng ký sự kiện nào
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        Hãy khám phá các sự kiện thú vị từ các câu lạc bộ và đăng ký tham gia.
      </p>

      <button
        type="button"
        onClick={onExplore}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
      >
        <CompassIcon />
        Khám Phá Sự Kiện
      </button>
    </div>
  );
}

// ─── Icon components ────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function QRIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      className="w-10 h-10 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"
      />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}
