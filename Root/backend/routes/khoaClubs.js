/**
 * Khoa Clubs Routes
 * Thêm vào file: backend/routes/khoaEvents.js
 * Hoặc tạo file mới: backend/routes/khoaClubs.js
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const khoaClubController = require("../controllers/khoaClubController");

/**
 * GET /api/khoa/clubs
 * Lấy danh sách tất cả CLB
 * Query: ?search=...&status=...
 */
router.get("/", auth, khoaClubController.getClubs);

/**
 * GET /api/khoa/clubs/:id
 * Xem chi tiết CLB (số TV, số SK, BCN, sự kiện gần đây)
 */
router.get("/:id", auth, khoaClubController.getClubDetail);

/**
 * PATCH /api/khoa/clubs/:id/status
 * Khóa hoặc mở lại CLB
 * Body: { status: "Hoạt động" | "Bị khóa" | "Không hoạt động", lyDo: "..." }
 */
router.patch("/:id/status", auth, khoaClubController.updateClubStatus);

module.exports = router;