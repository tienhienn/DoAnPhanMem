const express = require("express");
const router = express.Router();
const {
  getEventsForCTSV,
  approveEventByCTSV,
  rejectEventByCTSV,
} = require("../controllers/ctsvEventController");
const { auth } = require("../middleware/auth");

// Lấy danh sách sự kiện cho CTSV
router.get("/", auth, getEventsForCTSV);

// CTSV Phê duyệt
router.patch("/:id/approve", auth, approveEventByCTSV);

// CTSV Từ chối
router.patch("/:id/reject", auth, rejectEventByCTSV);

module.exports = router;
