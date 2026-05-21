/**
 * Utility functions cho việc lọc và tìm kiếm sự kiện
 * Requirements: 1.3, 1.4, 1.5, 2.2, 2.3, 2.4
 */

/**
 * Lọc sự kiện theo từ khóa (tên sự kiện hoặc tên câu lạc bộ, case-insensitive).
 * Nếu keyword rỗng thì trả về tất cả sự kiện.
 *
 * @param {Array} events - Danh sách sự kiện
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Array} Danh sách sự kiện khớp với từ khóa
 */
export function filterByKeyword(events, keyword) {
  if (!keyword || keyword.trim() === "") {
    return events;
  }
  const lowerKeyword = keyword.toLowerCase();
  return events.filter(
    (event) =>
      event.name.toLowerCase().includes(lowerKeyword) ||
      event.clubName.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Lọc sự kiện theo tên câu lạc bộ (khớp chính xác).
 * Nếu clubName là "all" hoặc rỗng thì trả về tất cả sự kiện.
 *
 * @param {Array} events - Danh sách sự kiện
 * @param {string} clubName - Tên câu lạc bộ cần lọc
 * @returns {Array} Danh sách sự kiện thuộc câu lạc bộ đã chọn
 */
export function filterByClub(events, clubName) {
  if (!clubName || clubName === "all") {
    return events;
  }
  return events.filter((event) => event.clubName === clubName);
}

/**
 * Lọc sự kiện còn chỗ trống (maxCapacity - registeredCount > 0).
 *
 * @param {Array} events - Danh sách sự kiện
 * @returns {Array} Danh sách sự kiện còn chỗ trống
 */
export function filterAvailable(events) {
  return events.filter(
    (event) => event.maxCapacity - event.registeredCount > 0
  );
}

/**
 * Trả về object mô tả trạng thái các nút hành động dựa trên trạng thái đăng ký
 * và số chỗ còn lại của sự kiện.
 *
 * - "registered" hoặc "attended": { viewQR: true, cancel: true, register: false }
 * - "unregistered" và còn chỗ: { viewQR: false, cancel: false, register: "enabled" }
 * - "unregistered" và hết chỗ: { viewQR: false, cancel: false, register: "disabled" }
 *
 * @param {Object} event - Đối tượng sự kiện
 * @param {string} registrationStatus - Trạng thái đăng ký: "unregistered" | "registered" | "attended"
 * @returns {{ viewQR: boolean, cancel: boolean, register: boolean|string }}
 */
export function getActionButtons(event, registrationStatus) {
  if (registrationStatus === "registered" || registrationStatus === "attended") {
    return { viewQR: true, cancel: true, register: false };
  }

  // unregistered
  const isPast = event.thoiGianBatDau && new Date(event.thoiGianBatDau) < new Date();
  const availableSlots = event.maxCapacity - event.registeredCount;

  if (isPast) {
    return { viewQR: false, cancel: false, register: "disabled_past" };
  }

  if (availableSlots > 0) {
    return { viewQR: false, cancel: false, register: "enabled" };
  } else {
    return { viewQR: false, cancel: false, register: "disabled" };
  }
}
