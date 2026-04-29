/**
 * SearchBar - Ô tìm kiếm sự kiện với debounce
 *
 * Props:
 * - onSearch: (keyword: string) => void  — callback sau debounce 300ms
 * - placeholder: string (optional)
 *
 * Requirements: 1.3
 */

import { useState, useEffect, useRef } from "react";

export default function SearchBar({
  onSearch,
  placeholder = "Tìm kiếm sự kiện...",
}) {
  const [value, setValue] = useState("");
  const debounceTimer = useRef(null);

  // Debounce: gọi onSearch sau 300ms kể từ lần gõ cuối
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      onSearch?.(value);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, onSearch]);

  function handleClear() {
    setValue("");
    // Gọi ngay lập tức khi clear (không cần debounce)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    onSearch?.("");
  }

  return (
    <div className="relative w-full">
      {/* Icon tìm kiếm */}
      <div
        className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
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
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white
                   text-sm text-slate-800 placeholder-slate-400
                   focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                   transition-shadow duration-150"
        aria-label={placeholder}
      />

      {/* Nút clear (X) — chỉ hiện khi có text */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400
                     hover:text-slate-600 transition-colors duration-150"
          aria-label="Xóa tìm kiếm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
