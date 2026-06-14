/**
 * QRScreen - Màn hình hiển thị mã QR điểm danh
 *
 * Requirements: 6.1, 6.2, 6.3
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import QRDisplay from "../components/qr/QRDisplay";

/**
 * Format ngày giờ sang tiếng Việt
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

export default function QRScreen() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  // State cho QR data từ API
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Wake Lock fallback message
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

  // Fetch QR data từ API
  useEffect(() => {
    let cancelled = false;

    async function fetchQR() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/api/events/${eventId}/qr`);
        if (!cancelled) {
          setQrData(response.data.data);
        }
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 403) {
          // Chưa đăng ký hoặc chưa được duyệt → redirect về trang chi tiết
          navigate(`/events/${eventId}`, { replace: true });
          return;
        }
        if (status === 404) {
          // Sự kiện không tồn tại → redirect về trang chủ
          navigate("/", { replace: true });
          return;
        }
        setError(err.response?.data?.error?.message || "Không thể tải mã QR");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchQR();
    return () => { cancelled = true; };
  }, [eventId, navigate]);

  // Wake Lock API - giữ màn hình sáng khi ở trang QR
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request("screen");
        } catch {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
            role="status"
            aria-label="Đang tải..."
          />
          <p className="text-sm text-slate-500">Đang tải mã QR...</p>
        </div>
      </div>
    );
  }

  // Error state (không phải 403/404 vì đã redirect)
  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <p className="text-base font-semibold text-slate-700 mb-2">Đã xảy ra lỗi</p>
        <p className="text-sm text-slate-500 mb-4">{error || "Không thể tải mã QR"}</p>
        <button
          type="button"
          onClick={() => navigate(`/events/${eventId}`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Quay lại sự kiện
        </button>
      </div>
    );
  }

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
        {/* Fallback message khi Wake Lock không được hỗ trợ */}
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
              {qrData.tenSK}
            </h1>
          </div>

          {/* Mã QR - nền trắng, độ tương phản cao */}
          <div className="flex items-center justify-center py-6 px-4 bg-white">
            <QRDisplay value={qrData.qrValue} size={280} />
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-dashed border-slate-200" />

          {/* Ảnh Đại Diện Sinh Viên Kiểm Diện */}
          <div className="flex flex-col items-center justify-center mt-5 mb-2">
            <div className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center">
              {qrData.anhDaiDien ? (
                <img
                  src={qrData.anhDaiDien}
                  alt="Ảnh chân dung"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${qrData.hoTen}`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-2xl uppercase">
                  {qrData.hoTen?.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1.5">
              Ảnh kiểm diện
            </span>
          </div>

          {/* Thông tin sinh viên và sự kiện */}
          <div className="px-5 pb-5 space-y-3">
            {/* Tên sinh viên */}
            <InfoRow
              label="Sinh viên"
              value={qrData.hoTen}
              bold
            />

            {/* Mã số sinh viên */}
            <InfoRow
              label="Mã số sinh viên"
              value={qrData.maSV}
              mono
            />

            {/* Tên sự kiện */}
            <InfoRow
              label="Sự kiện"
              value={qrData.tenSK}
            />

            {/* Ngày giờ sự kiện */}
            <InfoRow
              label="Thời gian"
              value={formatDateTime(qrData.thoiGianBatDau)}
            />
          </div>
        </div>

        {/* Nút Quay Lại ở dưới */}
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
