const express = require("express");
const router = express.Router();
const {
  getEventsForCTSV,
  getApprovedEventsForCTSV,
  getEventDetailForCTSV,
  getEventParticipants,
  approveEventByCTSV,
  rejectEventByCTSV,
} = require("../controllers/ctsvEventController");
const { auth, authorizeRole } = require("../middleware/auth");

const ctsvOnly = [auth, authorizeRole(["CTSV"])];

// Lấy danh sách sự kiện cho CTSV (duyệt cấp phép)
router.get("/", ...ctsvOnly, getEventsForCTSV);

// Sự kiện đã cấp phép — màn danh sách theo dõi
router.get("/approved", ...ctsvOnly, getApprovedEventsForCTSV);

// Chi tiết & danh sách đăng ký (phải đặt trước /:id/approve)
router.get("/:id/detail", ...ctsvOnly, getEventDetailForCTSV);
router.get("/:id/participants", ...ctsvOnly, getEventParticipants);

// CTSV Phê duyệt / Từ chối
router.patch("/:id/approve", ...ctsvOnly, approveEventByCTSV);
router.patch("/:id/reject", ...ctsvOnly, rejectEventByCTSV);

module.exports = router;
