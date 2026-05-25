// routes/reports.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getReportsByClub,
  createReport,
  deleteReport,
} = require("../controllers/reportController");

router.get("/", auth, getReportsByClub);
router.post("/", auth, upload.single("file"), createReport);
router.delete("/:id", auth, deleteReport);

module.exports = router;
