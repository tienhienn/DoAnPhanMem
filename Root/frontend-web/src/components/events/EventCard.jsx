/**
 * EventCard - Hiển thị thông tin tóm tắt của một sự kiện
 *
 * Props:
 * - event: Event object
 * - registrationStatus: "unregistered" | "registered" | "attended"
 * - onClick: () => void
 *
 * Requirements: 1.2
 */

import Badge from "../ui/Badge";

/**
 * Format ngày giờ sang tiếng Việt
 * Ví dụ: "Thứ Hai, 15/09/2025 - 08:00"
 *
 * @param {string} isoString - Chuỗi ISO 8601
 * @returns {string}
 */
function formatVietnameseDateTime(isoString) {
  const date = new Date(isoString);

  const dayNames = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  const dayName = dayNames[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${dayName}, ${day}/${month}/${year} - ${hours}:${minutes}`;
}

export default function EventCard({ event, registrationStatus, onClick }) {
  const availableSlots = event.maxCapacity - event.registeredCount;
  const isFull = availableSlots <= 0;

  return (
    <article
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer
                 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`Xem chi tiết sự kiện: ${event.name}`}
    >
      {/* Hình ảnh đại diện */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
            <svg
              className="w-12 h-12 text-indigo-300"
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
          </div>
        )}

        {/* Badge trạng thái đăng ký (góc trên phải) */}
        {registrationStatus === "registered" && (
          <div className="absolute top-2 right-2">
            <Badge type="registered">Đã đăng ký</Badge>
          </div>
        )}
        {registrationStatus === "attended" && (
          <div className="absolute top-2 right-2">
            <Badge type="attended">Đã điểm danh</Badge>
          </div>
        )}
      </div>

      {/* Nội dung card */}
      <div className="p-4 space-y-3">
        {/* Tên câu lạc bộ */}
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
          {event.clubName}
        </p>

        {/* Tên sự kiện */}
        <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-2">
          {event.name}
        </h3>

        {/* Ngày giờ */}
        <div className="flex items-start gap-2 text-sm text-slate-500">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatVietnameseDateTime(event.startDateTime)}</span>
        </div>

        {/* Địa điểm */}
        <div className="flex items-start gap-2 text-sm text-slate-500">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* Số chỗ còn lại & Điểm rèn luyện */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {isFull ? (
              <Badge type="full">Hết chỗ</Badge>
            ) : (
              <span className="text-xs text-slate-500">
                Còn{" "}
                <span className="font-semibold text-slate-700">
                  {availableSlots}
                </span>{" "}
                / {event.maxCapacity} chỗ
              </span>
            )}
            {event.diemRenLuyen && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                ⭐ +{event.diemRenLuyen} ĐHĐ
              </span>
            )}
          </div>

          {/* Mũi tên xem chi tiết */}
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </article>
  );
}
