/**
 * AppContext - Quản lý trạng thái toàn cục của ứng dụng
 * Requirements: 0.2, 2.1, 4.1, 5.1, 7.1
 */

import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../utils/apiClient";

export const AppContext = createContext(null);

/**
 * Map trangThaiDangKy từ API sang registrationStatus nội bộ.
 *
 * @param {string|null} trangThaiDangKy - Giá trị từ API
 * @returns {"registered"|"attended"|"unregistered"}
 */
function mapRegistrationStatus(trangThaiDangKy) {
  if (trangThaiDangKy === "da_duyet" || trangThaiDangKy === "cho_duyet") {
    return "registered";
  }
  if (trangThaiDangKy === "da_diem_danh") {
    return "attended";
  }
  return "unregistered";
}

/**
 * AppProvider - Provider bao bọc toàn bộ ứng dụng để cung cấp state toàn cục.
 *
 * State shape:
 * - events: Event[]
 * - isLoading: boolean
 * - error: string | null
 */
export function AppProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch danh sách sự kiện từ API với các filter tùy chọn.
   *
   * @param {{ search?: string, clubId?: string, availableOnly?: boolean }} [filters]
   */
  const fetchEvents = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.clubId && filters.clubId !== "all") params.clubId = filters.clubId;
      if (filters.availableOnly) params.availableOnly = true;

      const response = await apiClient.get("/api/events", { params });
      setEvents(response.data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Không thể tải danh sách sự kiện");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Đăng ký tham gia sự kiện, sau đó refresh danh sách.
   *
   * @param {string} maSK - Mã sự kiện (đã trim)
   * @throws {Error} Nếu API trả về lỗi
   */
  async function registerEvent(maSK) {
    await apiClient.post(`/api/events/${maSK}/register`);
    await fetchEvents();
  }

  /**
   * Hủy đăng ký sự kiện, sau đó refresh danh sách.
   *
   * @param {string} maSK - Mã sự kiện (đã trim)
   */
  async function cancelRegistration(maSK) {
    await apiClient.delete(`/api/events/${maSK}/register`);
    await fetchEvents();
  }

  /**
   * Lấy trạng thái đăng ký từ event object (đã có trangThaiDangKy từ API).
   * Dùng cho EventDetailPage khi đã fetch chi tiết sự kiện.
   *
   * @param {string|null} trangThaiDangKy - Giá trị trangThaiDangKy từ API
   * @returns {"registered"|"attended"|"unregistered"}
   */
  function getRegistrationStatus(trangThaiDangKy) {
    return mapRegistrationStatus(trangThaiDangKy);
  }

  /**
   * Lấy danh sách sự kiện mà sinh viên đã đăng ký từ API.
   *
   * @returns {Promise<Event[]>}
   */
  async function getRegisteredEvents() {
    const response = await apiClient.get("/api/students/me/events");
    return response.data.data ?? [];
  }

  const value = {
    events,
    isLoading,
    error,
    fetchEvents,
    registerEvent,
    cancelRegistration,
    getRegistrationStatus,
    getRegisteredEvents,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook tiện ích để sử dụng AppContext.
 * Phải được dùng bên trong AppProvider.
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext phải được dùng bên trong AppProvider");
  }
  return context;
}
