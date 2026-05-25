const express = require("express");
const router = express.Router();
const {
  getEventsByClub,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEventForApproval,
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

module.exports = router;
