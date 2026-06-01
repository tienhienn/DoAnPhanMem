/**
 * EventListPage - Trang danh sách sự kiện câu lạc bộ
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";
import EventCard from "../components/events/EventCard";
import SearchBar from "../components/events/SearchBar";
import EventFilter from "../components/events/EventFilter";

export default function EventListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState({ clubName: "all", availableOnly: false });

  // Lấy danh sách clubs unique từ events (dùng tenCLB từ API)
  const clubs = useMemo(() => {
    const clubSet = new Set(events.map((e) => e.tenCLB).filter(Boolean));
    return Array.from(clubSet).sort();
  }, [events]);

  // Fetch events từ API khi filter hoặc keyword thay đổi
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (keyword.trim()) params.search = keyword.trim();
      if (filter.clubName && filter.clubName !== "all") {
        // Tìm maCLB tương ứng với tenCLB đã chọn
        const matchedEvent = events.find((e) => e.tenCLB === filter.clubName);
        if (matchedEvent?.maCLB) {
          params.clubId = matchedEvent.maCLB.trim();
        }
      }
      if (filter.availableOnly) params.availableOnly = true;

      const response = await apiClient.get("/api/events", { params });
      setEvents(response.data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể tải danh sách sự kiện");
    } finally {
      setIsLoading(false);
    }
  }, [keyword, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch khi mount và khi filter/keyword thay đổi
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = useCallback((kw) => {
    setKeyword(kw);
  }, []);

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Sự Kiện Câu Lạc Bộ
          </h1>
          {!isLoading && !error && (
            <p className="mt-1 text-sm text-slate-500">
              {events.length} sự kiện
            </p>
          )}
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Tìm kiếm sự kiện hoặc câu lạc bộ..."
            />
          </div>
          <EventFilter
            clubs={clubs}
            currentFilter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
                role="status"
                aria-label="Đang tải..."
              />
              <p className="text-sm text-slate-500">Đang tải sự kiện...</p>
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
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchEvents}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Event grid hoặc empty state */}
        {!isLoading && !error && (
          events.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.maSK.trim()}
                  event={{
                    ...event,
                    // Ánh xạ field API → field EventCard dùng
                    name: event.tenSK,
                    clubName: event.tenCLB,
                    startDateTime: event.thoiGianBatDau,
                    endDateTime: event.thoiGianKetThuc,
                    location: event.diaDiem,
                    maxCapacity: event.soNguoiToiDa,
                    registeredCount: event.soNguoiDaDangKy,
                    imageUrl: event.urlAnh,
                    diemRenLuyen: event.diemRenLuyen,
                  }}
                  registrationStatus="unregistered"
                  onClick={() => {
                    const eventId = event.maSK.trim();
                    if (user?.role === "CTSV") {
                      navigate(`/ctsv/events/${eventId}`);
                    } else {
                      navigate(`/events/${eventId}`);
                    }
                  }}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Icon lịch */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <svg
          className="h-8 w-8 text-slate-400"
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
      <p className="text-base font-semibold text-slate-700">
        Không có sự kiện nào
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
      </p>
    </div>
  );
}
