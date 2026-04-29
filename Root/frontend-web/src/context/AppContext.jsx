/**
 * AppContext - Quản lý trạng thái toàn cục của ứng dụng
 * Requirements: 3.2, 3.3, 3.5, 4.2, 4.3
 */

import { createContext, useContext, useState } from "react";
import { mockStudent, mockEvents, mockRegistrations } from "../data/mockData";

export const AppContext = createContext(null);

/**
 * AppProvider - Provider bao bọc toàn bộ ứng dụng để cung cấp state toàn cục.
 *
 * State shape:
 * - currentStudent: Student
 * - events: Event[]
 * - registrations: { [eventId]: RegistrationStatus }
 */
export function AppProvider({ children }) {
  const [currentStudent] = useState(mockStudent);
  const [events, setEvents] = useState(mockEvents);
  const [registrations, setRegistrations] = useState({ ...mockRegistrations });

  /**
   * Đăng ký tham gia sự kiện.
   * - Kiểm tra còn chỗ trước khi đăng ký
   * - Cập nhật registrations thành "registered"
   * - Tăng registeredCount của sự kiện lên 1
   *
   * @param {string} eventId
   * @throws {Error} Nếu sự kiện đã hết chỗ
   */
  function registerEvent(eventId) {
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      throw new Error(`Sự kiện không tồn tại: ${eventId}`);
    }

    // Kiểm tra còn chỗ (Requirement 3.5)
    if (event.registeredCount >= event.maxCapacity) {
      throw new Error("Sự kiện đã hết chỗ, không thể đăng ký");
    }

    // Cập nhật registrations (Requirement 3.2)
    setRegistrations((prev) => ({
      ...prev,
      [eventId]: "registered",
    }));

    // Tăng registeredCount lên 1 (Requirement 3.2)
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registeredCount: e.registeredCount + 1 }
          : e
      )
    );
  }

  /**
   * Hủy đăng ký sự kiện.
   * - Cập nhật registrations thành "unregistered"
   * - Giảm registeredCount của sự kiện xuống 1
   *
   * @param {string} eventId
   */
  function cancelRegistration(eventId) {
    // Cập nhật registrations (Requirement 4.2)
    setRegistrations((prev) => ({
      ...prev,
      [eventId]: "unregistered",
    }));

    // Giảm registeredCount xuống 1 (Requirement 4.2)
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) }
          : e
      )
    );
  }

  /**
   * Lấy trạng thái đăng ký của một sự kiện.
   * Mặc định trả về "unregistered" nếu chưa có trong map.
   *
   * @param {string} eventId
   * @returns {RegistrationStatus} "unregistered" | "registered" | "attended"
   */
  function getRegistrationStatus(eventId) {
    return registrations[eventId] ?? "unregistered";
  }

  /**
   * Lấy danh sách sự kiện mà sinh viên đã đăng ký
   * (registrationStatus !== "unregistered").
   *
   * @returns {Event[]}
   */
  function getRegisteredEvents() {
    return events.filter(
      (event) => (registrations[event.id] ?? "unregistered") !== "unregistered"
    );
  }

  const value = {
    currentStudent,
    events,
    registrations,
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
