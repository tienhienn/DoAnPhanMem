const express = require("express");
const router = express.Router();

// Import các hàm từ controller của Khoa
const {
  getEventsForFaculty,
  approveEventByFaculty,
  rejectEventByFaculty,
} = require("../controllers/khoaEventController");

// Import middleware xác thực (Dùng chung auth với BCN)
const { auth } = require("../middleware/auth");

/**
 * Lấy danh sách sự kiện cần duyệt/đã duyệt của Khoa
 * GET /api/khoa/events?TrangThai=...
 */
router.get("/", auth, getEventsForFaculty);

/**
 * Duyệt sự kiện (Cán bộ Khoa)
 * PATCH /api/khoa/events/:id/approve
 */
router.patch("/:id/approve", auth, approveEventByFaculty);

/**
 * Từ chối sự kiện (Cán bộ Khoa)
 * PATCH /api/khoa/events/:id/reject
 */
router.patch("/:id/reject", auth, rejectEventByFaculty);

module.exports = router;
