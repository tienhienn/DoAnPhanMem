/**
 * QRScreen - Màn hình hiển thị mã QR điểm danh
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import QRDisplay from "../components/qr/QRDisplay";
import { generateQRValue } from "../utils/qrHelpers";

/**
 * Format ngày giờ sang tiếng Việt
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

export default function QRScreen() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { events, currentStudent, getRegistrationStatus } = useAppContext();

  // State cho Wake Lock fallback message (Requirement 5.5)
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

  // Tìm sự kiện theo eventId
  const event = events.find((e) => e.id === eventId);

  // Lấy trạng thái đăng ký
  const registrationStatus = event ? getRegistrationStatus(eventId) : null;

  // Wake Lock API - giữ màn hình sáng khi ở trang QR (Requirement 5.4)
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request("screen");
        } catch (err) {
          setShowFallbackMessage(true);
        }
      } else {
        setShowFallbackMessage(true);
      }
    };

    requestWakeLock();

    return () => {
      wakeLock?.release();
    };
  }, []);

  // Nếu không tìm thấy sự kiện → redirect về trang chủ (Requirement 5.1)
  if (!event) {
    return <Navigate to="/" replace />;
  }

  // Nếu chưa đăng ký → redirect về trang chi tiết sự kiện (Requirement 5.1)
  if (registrationStatus === "unregistered") {
    return <Navigate to={`/events/${eventId}`} replace />;
  }

  // Tạo giá trị QR từ mã sinh viên và mã sự kiện (Requirement 5.2)
  const qrValue = generateQRValue(currentStudent.studentId, event.id);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header với nút quay lại */}
      <div className="px-4 pt-4 pb-2 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(`/events/${eventId}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          aria-label="Quay lại trang chi tiết sự kiện"
        >
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
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay Lại
        </button>
      </div>

      {/* Nội dung chính - căn giữa màn hình */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:px-6">
        {/* Fallback message khi Wake Lock không được hỗ trợ (Requirement 5.5) */}
        {showFallbackMessage && (
          <div
            className="mb-5 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700"
            role="alert"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            Hãy giữ màn hình sáng để điểm danh
          </div>
        )}

        {/* Card chứa QR và thông tin */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Tiêu đề card */}
          <div className="bg-indigo-600 px-5 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-0.5">
              Mã QR Điểm Danh
            </p>
            <h1 className="text-base font-bold text-white leading-snug line-clamp-2">
              {event.name}
            </h1>
          </div>

          {/* Mã QR - nền trắng, độ tương phản cao (Requirement 5.7) */}
          <div className="flex items-center justify-center py-6 px-4 bg-white">
            <QRDisplay value={qrValue} size={280} />
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-dashed border-slate-200" />

          {/* Thông tin sinh viên và sự kiện (Requirement 5.3) */}
          <div className="px-5 py-5 space-y-3">
            {/* Tên sinh viên */}
            <InfoRow
              label="Sinh viên"
              value={currentStudent.fullName}
              bold
            />

            {/* Mã số sinh viên */}
            <InfoRow
              label="Mã số sinh viên"
              value={currentStudent.studentId}
              mono
            />

            {/* Tên sự kiện */}
            <InfoRow
              label="Sự kiện"
              value={event.name}
            />

            {/* Ngày giờ sự kiện */}
            <InfoRow
              label="Thời gian"
              value={formatDateTime(event.startDateTime)}
            />
          </div>
        </div>

        {/* Nút Quay Lại ở dưới (Requirement 5.6) */}
        <button
          type="button"
          onClick={() => navigate(`/events/${eventId}`)}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
        >
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
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay Lại
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Hàng thông tin với label và giá trị
 * @param {string} label
 * @param {string} value
 * @param {boolean} [bold] - In đậm giá trị
 * @param {boolean} [mono] - Font monospace cho mã số
 */
function InfoRow({ label, value, bold = false, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-sm text-slate-800 ${bold ? "font-semibold" : ""} ${
          mono ? "font-mono tracking-wider" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
