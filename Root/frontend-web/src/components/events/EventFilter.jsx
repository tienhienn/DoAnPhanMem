/**
 * EventFilter - Bộ lọc sự kiện theo câu lạc bộ và trạng thái còn chỗ
 *
 * Props:
 * - clubs: string[]                          — danh sách tên câu lạc bộ
 * - onFilterChange: ({ clubName, availableOnly }) => void
 * - currentFilter: { clubName: string, availableOnly: boolean }
 *
 * Requirements: 1.4, 1.5
 */

export default function EventFilter({ clubs = [], onFilterChange, currentFilter = {} }) {
  const { clubName = "all", availableOnly = false } = currentFilter;

  function handleClubChange(e) {
    onFilterChange?.({ clubName: e.target.value, availableOnly });
  }

  function handleAvailableOnlyChange(e) {
    onFilterChange?.({ clubName, availableOnly: e.target.checked });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Dropdown lọc theo câu lạc bộ */}
      <div className="relative">
        <select
          value={clubName}
          onChange={handleClubChange}
          className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white
                     text-sm text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                     transition-shadow duration-150 cursor-pointer"
          aria-label="Lọc theo câu lạc bộ"
        >
          <option value="all">Tất cả câu lạc bộ</option>
          {clubs.map((club) => (
            <option key={club} value={club}>
              {club}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div
          className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none"
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Toggle lọc "Chỉ hiện sự kiện còn chỗ" */}
      <label className="flex items-center gap-2 cursor-pointer select-none group">
        <div className="relative">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={handleAvailableOnlyChange}
            className="sr-only peer"
            aria-label="Chỉ hiện sự kiện còn chỗ"
          />
          {/* Track */}
          <div
            className="w-9 h-5 rounded-full border border-slate-200 bg-slate-100
                       peer-checked:bg-indigo-500 peer-checked:border-indigo-500
                       peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400
                       transition-colors duration-200"
          />
          {/* Thumb */}
          <div
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
                       peer-checked:translate-x-4
                       transition-transform duration-200"
          />
        </div>
        <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors duration-150">
          Còn chỗ
        </span>
      </label>
    </div>
  );
}
