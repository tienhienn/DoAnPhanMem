const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
} = require("../controllers/ctsvReportController");

router.get("/", auth, getAllSubmissions);
router.patch("/:id/approve", auth, approveSubmission);
router.patch("/:id/reject", auth, rejectSubmission);

module.exports = router;
