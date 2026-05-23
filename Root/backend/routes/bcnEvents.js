const express = require("express");
const router = express.Router();
const {
  getEventsByClub,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEventForApproval,
  approveFaculty,
  approveCTSV,
  rejectEvent,
} = require("../controllers/bcnEventController");
const { auth } = require("../middleware/auth");

/**
 * Lấy danh sách sự kiện của CLB
 * GET /api/bcn/events?MaCLB=...&TrangThai=...
 */
router.get("/", auth, getEventsByClub);

/**
 * Lấy chi tiết sự kiện
 * GET /api/bcn/events/:id
 */
router.get("/:id", auth, getEventDetail);

/**
 * Tạo sự kiện mới
 * POST /api/bcn/events
 */
router.post("/", auth, createEvent);

/**
 * Cập nhật sự kiện
 * PUT /api/bcn/events/:id
 */
router.put("/:id", auth, updateEvent);

/**
 * Xóa sự kiện
 * DELETE /api/bcn/events/:id
 */
router.delete("/:id", auth, deleteEvent);

/**
 * Gửi sự kiện để duyệt
 * PATCH /api/bcn/events/:id/submit
 */
router.patch("/:id/submit", auth, submitEventForApproval);

/**
 * Duyệt sự kiện (Cán bộ Khoa)
 * PATCH /api/bcn/events/:id/approve-faculty
 */
router.patch("/:id/approve-faculty", auth, approveFaculty);

/**
 * Duyệt sự kiện (Phòng CTSV)
 * PATCH /api/bcn/events/:id/approve-ctsv
 */
router.patch("/:id/approve-ctsv", auth, approveCTSV);

/**
 * Từ chối sự kiện
 * PATCH /api/bcn/events/:id/reject
 */
router.patch("/:id/reject", auth, rejectEvent);

module.exports = router;
