/**
 * EventDetailPage - Trang chi tiết sự kiện
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import { getActionButtons } from "../utils/eventHelpers";

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

export default function EventDetailPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { events, getRegistrationStatus, registerEvent, cancelRegistration } =
    useAppContext();

  // Modal state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null); // { message, type }

  // Tìm sự kiện theo eventId
  const event = events.find((e) => e.id === eventId);

  // Nếu không tìm thấy sự kiện → hiển thị trang 404
  if (!event) {
    return <NotFoundPage onGoHome={() => navigate("/")} />;
  }

  const registrationStatus = getRegistrationStatus(eventId);
  const availableSlots = event.maxCapacity - event.registeredCount;
  const actionButtons = getActionButtons(event, registrationStatus);

  // Xử lý xác nhận đăng ký
  function handleConfirmRegister() {
    setRegisterModalOpen(false);
    try {
      registerEvent(eventId);
      setToast({ message: "Đăng ký thành công!", type: "success" });
    } catch (err) {
      setToast({
        message: err.message || "Sự kiện đã hết chỗ, không thể đăng ký",
        type: "error",
      });
    }
  }

  // Xử lý xác nhận hủy đăng ký
  function handleConfirmCancel() {
    setCancelModalOpen(false);
    cancelRegistration(eventId);
    setToast({ message: "Đã hủy đăng ký thành công", type: "success" });
  }

  // Tính phần trăm đã đăng ký cho progress bar
  const registeredPercent = Math.min(
    100,
    Math.round((event.registeredCount / event.maxCapacity) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nút quay lại */}
      <div className="max-w-3xl mx-auto px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          aria-label="Quay về trang chủ"
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
          Quay lại
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-10 sm:px-6">
        {/* Hình ảnh đại diện */}
        <div className="mt-4 rounded-2xl overflow-hidden shadow-sm">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-56 object-cover sm:h-72"
          />
        </div>

        {/* Nội dung chính */}
        <div className="mt-6 space-y-6">
          {/* Tên sự kiện và câu lạc bộ */}
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-1">
              {event.clubName}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {event.name}
            </h1>
          </div>

          {/* Thông tin chi tiết */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            {/* Ngày giờ bắt đầu */}
            <InfoRow
              icon={<CalendarIcon />}
              label="Bắt đầu"
              value={formatDateTime(event.startDateTime)}
            />

            {/* Ngày giờ kết thúc */}
            <InfoRow
              icon={<CalendarIcon />}
              label="Kết thúc"
              value={formatDateTime(event.endDateTime)}
            />

            {/* Địa điểm */}
            <InfoRow
              icon={<LocationIcon />}
              label="Địa điểm"
              value={event.location}
            />

            {/* Số lượng chỗ */}
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0 text-slate-400">
                <UsersIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Số lượng chỗ
                </p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">
                    {event.registeredCount}/{event.maxCapacity} đã đăng ký
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      availableSlots <= 0
                        ? "text-red-600"
                        : availableSlots <= 5
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  >
                    {availableSlots <= 0
                      ? "Hết chỗ"
                      : `Còn ${availableSlots} chỗ`}
                  </span>
                </div>
                {/* Progress bar */}
                <div
                  className="w-full bg-slate-100 rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={event.registeredCount}
                  aria-valuemin={0}
                  aria-valuemax={event.maxCapacity}
                  aria-label={`${event.registeredCount} trên ${event.maxCapacity} chỗ đã đăng ký`}
                >
                  <div
                    className={`h-2 rounded-full transition-all ${
                      registeredPercent >= 100
                        ? "bg-red-500"
                        : registeredPercent >= 80
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${registeredPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              Mô tả sự kiện
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Khu vực nút hành động */}
          <ActionArea
            actionButtons={actionButtons}
            availableSlots={availableSlots}
            onRegister={() => setRegisterModalOpen(true)}
            onViewQR={() => navigate(`/events/${eventId}/qr`)}
            onCancel={() => setCancelModalOpen(true)}
          />
        </div>
      </div>

      {/* Modal xác nhận đăng ký */}
      <Modal
        isOpen={registerModalOpen}
        title="Xác nhận đăng ký"
        message={`Bạn muốn đăng ký tham gia sự kiện "${event.name}" do ${event.clubName} tổ chức vào ${formatDateTime(event.startDateTime)}?`}
        confirmLabel="Xác Nhận"
        cancelLabel="Hủy"
        onConfirm={handleConfirmRegister}
        onCancel={() => setRegisterModalOpen(false)}
        variant="default"
      />

      {/* Modal xác nhận hủy đăng ký */}
      <Modal
        isOpen={cancelModalOpen}
        title="Hủy đăng ký"
        message="Bạn có chắc muốn hủy đăng ký? Chỗ của bạn sẽ được giải phóng cho sinh viên khác."
        confirmLabel="Xác Nhận Hủy"
        cancelLabel="Giữ Lại"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalOpen(false)}
        variant="danger"
      />

      {/* Toast thông báo */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Hàng thông tin với icon, label và giá trị */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/** Khu vực nút hành động theo trạng thái đăng ký */
function ActionArea({
  actionButtons,
  availableSlots,
  onRegister,
  onViewQR,
  onCancel,
}) {
  // Đã đăng ký → hiển thị "Xem Mã QR" + "Hủy Đăng Ký"
  if (actionButtons.viewQR && actionButtons.cancel) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onViewQR}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          <QRIcon />
          Xem Mã QR
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors border border-red-200"
        >
          <XIcon />
          Hủy Đăng Ký
        </button>
      </div>
    );
  }

  // Chưa đăng ký
  const isDisabled = actionButtons.register === "disabled";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={isDisabled ? undefined : onRegister}
        disabled={isDisabled}
        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isDisabled
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
        }`}
        aria-disabled={isDisabled}
      >
        <TicketIcon />
        Đăng Ký Tham Gia
      </button>
      {isDisabled && (
        <p className="text-center text-sm text-red-500 font-medium">
          Sự kiện đã hết chỗ
        </p>
      )}
    </div>
  );
}

/** Trang 404 đơn giản khi không tìm thấy sự kiện */
function NotFoundPage({ onGoHome }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <svg
          className="h-10 w-10 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Không tìm thấy sự kiện
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <button
        type="button"
        onClick={onGoHome}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
      >
        Quay về trang chủ
      </button>
    </div>
  );
}

// ─── Icon components ────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function QRIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
