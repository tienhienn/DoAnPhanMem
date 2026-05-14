/**
 * Admin Events Routes
 * Định nghĩa các endpoints cho quản lý sự kiện
 */

const express = require("express");
const router = express.Router();
const { verifyAuth, authorizeRole } = require("../middleware/auth");
const adminEventController = require("../controllers/adminEventController");

/**
 * ================================
 * MIDDLEWARE
 * ================================
 * Tất cả các route dưới đây đều yêu cầu xác thực (verifyAuth)
 */
router.use(verifyAuth);

/**
 * ================================
 * ROUTES
 * ================================
 */

/**
 * GET /api/admin/events
 * Lấy danh sách sự kiện
 *
 * Query Parameters:
 * - page: Trang (default: 1)
 * - limit: Số bản ghi trên trang (default: 10)
 * - status: Lọc theo trạng thái (draft, pending_faculty, pending_student_affairs, approved, rejected)
 * - search: Tìm kiếm theo tên sự kiện
 *
 * Roles:
 * - BCN: Lấy tất cả sự kiện của CLB
 * - KHOA: Lấy sự kiện ở trạng thái pending_faculty
 * - CTSV: Lấy sự kiện ở trạng thái pending_student_affairs
 * - ADMIN: Lấy tất cả sự kiện
 */
router.get("/", adminEventController.getEvents);

/**
 * GET /api/admin/events/:id
 * Lấy chi tiết sự kiện theo ID
 *
 * URL Parameters:
 * - id: Mã sự kiện (MaSK)
 *
 * Response: Thông tin chi tiết sự kiện
 */
router.get("/:id", adminEventController.getEventDetail);

/**
 * POST /api/admin/events
 * BCN thêm sự kiện mới
 *
 * Request Body:
 * {
 *   "name": "string (required)",              // Tên sự kiện
 *   "description": "string",                  // Mô tả sự kiện
 *   "startTime": "ISO 8601 datetime",         // Thời gian bắt đầu
 *   "endTime": "ISO 8601 datetime",           // Thời gian kết thúc
 *   "location": "string (required)",          // Địa điểm
 *   "quota": "number (required)",             // Số người tối đa
 *   "points": "number",                       // Điểm rèn luyện
 *   "costEstimate": "number",                 // Chi phí dự kiến
 *   "eventType": "string"                     // Loại sự kiện (Workshop, Cuộc thi, Khóa học, etc.)
 * }
 *
 * Roles: BCN (Ban chủ nhiệm CLB)
 * Response: Thông tin sự kiện được tạo (trạng thái: draft)
 */
router.post("/", authorizeRole(["BCN"]), adminEventController.createEvent);

/**
 * PUT /api/admin/events/:id
 * BCN cập nhật sự kiện
 *
 * URL Parameters:
 * - id: Mã sự kiện (MaSK)
 *
 * Request Body: (Giống POST /api/admin/events)
 * {
 *   "name": "string (required)",
 *   "description": "string",
 *   "startTime": "ISO 8601 datetime",
 *   "endTime": "ISO 8601 datetime",
 *   "location": "string (required)",
 *   "quota": "number (required)",
 *   "points": "number",
 *   "costEstimate": "number",
 *   "eventType": "string"
 * }
 *
 * Rules:
 * - BCN chỉ có thể sửa sự kiện của CLB mình
 * - Chỉ có thể sửa sự kiện ở trạng thái 'draft' hoặc 'rejected'
 *
 * Response: Thông tin sự kiện được cập nhật (trạng thái reset về: draft)
 */
router.put("/:id", authorizeRole(["BCN"]), adminEventController.updateEvent);

/**
 * DELETE /api/admin/events/:id
 * BCN xóa sự kiện
 *
 * URL Parameters:
 * - id: Mã sự kiện (MaSK)
 *
 * Rules:
 * - BCN chỉ có thể xóa sự kiện của CLB mình
 * - Chỉ có thể xóa sự kiện ở trạng thái 'draft' hoặc 'rejected'
 *
 * Response: Xác nhận sự kiện đã bị xóa
 */
router.delete("/:id", authorizeRole(["BCN"]), adminEventController.deleteEvent);

/**
 * PATCH /api/admin/events/:id/review
 * KHOA hoặc CTSV duyệt/từ chối sự kiện
 *
 * URL Parameters:
 * - id: Mã sự kiện (MaSK)
 *
 * Request Body:
 * {
 *   "status": "string (required)",        // 'approved' hoặc 'rejected'
 *   "feedback": "string"                  // Lý do từ chối (nếu rejected)
 * }
 *
 * Rules:
 * - KHOA duyệt sự kiện ở trạng thái 'pending_faculty'
 * - CTSV duyệt sự kiện ở trạng thái 'pending_student_affairs'
 * - Nếu từ chối, cần ghi rõ lý do (feedback)
 *
 * Response: Xác nhận duyệt/từ chối sự kiện
 */
router.patch(
  "/:id/review",
  authorizeRole(["KHOA", "CTSV"]),
  adminEventController.reviewEvent,
);

/**
 * ================================
 * ERROR HANDLING
 * ================================
 */
router.use((err, req, res, next) => {
  console.error("❌ Router error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    data: null,
  });
});

module.exports = router;
