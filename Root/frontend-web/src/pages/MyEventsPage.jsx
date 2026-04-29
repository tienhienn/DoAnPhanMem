/**
 * MyEventsPage - Trang "Sự Kiện Của Tôi"
 * Hiển thị danh sách sự kiện mà sinh viên đã đăng ký
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Badge from "../components/ui/Badge";

/**
 * Format ngày giờ sang tiếng Việt ngắn gọn
 * Ví dụ: "Thứ Hai, 15 tháng 9, 2025 lúc 08:00"
 */
function formatDateTime(isoString) {
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
  const { getRegisteredEvents, getRegistrationStatus } = useAppContext();

  const registeredEvents = getRegisteredEvents();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-xl font-bold text-slate-900">Sự Kiện Của Tôi</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {registeredEvents.length === 0 ? (
          /* Empty state */
          <EmptyState onExplore={() => navigate("/")} />
        ) : (
          /* Danh sách sự kiện đã đăng ký */
          <ul className="space-y-3" aria-label="Danh sách sự kiện đã đăng ký">
            {registeredEvents.map((event) => {
              const status = getRegistrationStatus(event.id);
              return (
                <EventItem
                  key={event.id}
                  event={event}
                  status={status}
                  onViewDetail={() => navigate(`/events/${event.id}`)}
                  onViewQR={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${event.id}/qr`);
                  }}
                />
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * EventItem - Một item trong danh sách sự kiện đã đăng ký
 *
 * Hiển thị: thumbnail, tên sự kiện, tên CLB, ngày giờ, badge trạng thái, nút QR
 */
function EventItem({ event, status, onViewDetail, onViewQR }) {
  return (
    <li>
      <button
        type="button"
        onClick={onViewDetail}
        className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={`Xem chi tiết sự kiện ${event.name}`}
      >
        <div className="flex items-stretch gap-0">
          {/* Thumbnail */}
          <div className="shrink-0 w-24 sm:w-32">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
              style={{ minHeight: "96px" }}
            />
          </div>

          {/* Nội dung */}
          <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between gap-2">
            <div className="space-y-1">
              {/* Tên câu lạc bộ */}
              <p className="text-xs font-medium text-indigo-600 truncate">
                {event.clubName}
              </p>

              {/* Tên sự kiện */}
              <h2 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                {event.name}
              </h2>

              {/* Ngày giờ */}
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <CalendarIcon />
                <span className="truncate">{formatDateTime(event.startDateTime)}</span>
              </p>
            </div>

            {/* Badge trạng thái + nút QR */}
            <div className="flex items-center justify-between gap-2">
              <StatusBadge status={status} />

              {/* Nút Xem Mã QR */}
              <button
                type="button"
                onClick={onViewQR}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors border border-indigo-100"
                aria-label={`Xem mã QR sự kiện ${event.name}`}
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
 * StatusBadge - Badge trạng thái đăng ký
 * "registered" → Badge type="registered" text "Đã đăng ký"
 * "attended"   → Badge type="attended"   text "Đã điểm danh"
 */
function StatusBadge({ status }) {
  if (status === "attended") {
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
