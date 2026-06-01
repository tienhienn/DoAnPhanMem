/**
 * CTSVClubCard - Thẻ câu lạc bộ (phong cách đồng nhất với EventCard)
 */

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function truncateText(text, maxLen = 100) {
  if (!text) return "Chưa có mô tả";
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trim()}…`;
}

export default function CTSVClubCard({ club, onClick }) {
  const memberCount = club.SoThanhVien ?? 0;

  return (
    <article
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer
                 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={`Xem chi tiết câu lạc bộ: ${club.TenCLB}`}
    >
      {/* Hình ảnh đại diện */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {club.Logo ? (
          <img
            src={club.Logo}
            alt={club.TenCLB}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Hoạt động
          </span>
        </div>
      </div>

      {/* Nội dung card */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide line-clamp-1">
          {club.LinhVuc || "Câu lạc bộ"}
        </p>

        <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-2">
          {club.TenCLB}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {truncateText(club.MoTa)}
        </p>

        {/* Đơn vị quản lý */}
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="line-clamp-1">{club.tenDVQL || "—"}</span>
        </div>

        {/* Ngày thành lập */}
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
          <span>Thành lập: {formatDate(club.NgayThanhLap)}</span>
        </div>

        {/* Thành viên & Chủ nhiệm */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{memberCount}</span> thành viên
            </span>
            {club.TenChuNhiem && (
              <span className="text-[11px] text-slate-400 truncate">
                CN: {club.TenChuNhiem}
              </span>
            )}
          </div>

          <svg
            className="w-4 h-4 text-slate-400 shrink-0"
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
