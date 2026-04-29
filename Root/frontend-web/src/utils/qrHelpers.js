/**
 * Utility functions cho việc tạo chuỗi dữ liệu mã QR
 * Requirements: 5.2
 */

/**
 * Tạo chuỗi dữ liệu QR từ mã sinh viên và mã sự kiện.
 * Format: HCMUTE-{studentId}-{eventId}
 *
 * @param {string} studentId - Mã số sinh viên
 * @param {string} eventId - Mã sự kiện
 * @returns {string} Chuỗi dữ liệu QR
 */
export function generateQRValue(studentId, eventId) {
  return `HCMUTE-${studentId}-${eventId}`;
}
