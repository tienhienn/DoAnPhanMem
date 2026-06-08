const express = require("express");
const router = express.Router();
const {
  getEventsByClub,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEventForApproval,
  markAttendance,
  getEventParticipantsForBCN,
} = require("../controllers/bcnEventController");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

/**
 * Điểm danh sinh viên qua QR / ID
 * POST /api/bcn/events/attendance
 */
router.post("/attendance", auth, markAttendance);

/**
 * Lấy danh sách sinh viên đăng ký sự kiện
 * GET /api/bcn/events/:id/participants
 */
router.get("/:id/participants", auth, getEventParticipantsForBCN);

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
router.post("/", auth, upload.fields([{ name: 'UrlAnh', maxCount: 1 }, { name: 'FileDinhKem', maxCount: 1 }]), createEvent);

/**
 * Cập nhật sự kiện
 * PUT /api/bcn/events/:id
 */
router.put("/:id", auth, upload.fields([{ name: 'UrlAnh', maxCount: 1 }, { name: 'FileDinhKem', maxCount: 1 }]), updateEvent);

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

module.exports = router;
