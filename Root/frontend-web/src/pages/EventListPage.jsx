/**
 * EventListPage - Trang danh sách sự kiện câu lạc bộ
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import EventCard from "../components/events/EventCard";
import SearchBar from "../components/events/SearchBar";
import EventFilter from "../components/events/EventFilter";
import { filterByKeyword, filterByClub, filterAvailable } from "../utils/eventHelpers";

export default function EventListPage() {
  const { events, getRegistrationStatus } = useAppContext();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState({ clubName: "all", availableOnly: false });

  // Lấy danh sách clubs unique từ events
  const clubs = useMemo(() => {
    const clubSet = new Set(events.map((e) => e.clubName));
    return Array.from(clubSet).sort();
  }, [events]);

  // Logic lọc kết hợp: keyword → clubName → availableOnly (áp dụng tuần tự)
  const filteredEvents = useMemo(() => {
    let result = events;
    result = filterByKeyword(result, keyword);
    result = filterByClub(result, filter.clubName);
    if (filter.availableOnly) {
      result = filterAvailable(result);
    }
    return result;
  }, [events, keyword, filter]);

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
          <p className="mt-1 text-sm text-slate-500">
            {filteredEvents.length} sự kiện
          </p>
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

        {/* Event grid hoặc empty state */}
        {filteredEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                registrationStatus={getRegistrationStatus(event.id)}
                onClick={() => navigate(`/events/${event.id}`)}
              />
            ))}
          </div>
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
