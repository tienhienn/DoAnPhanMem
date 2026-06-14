/**
 * Khoa Dashboard Routes
 * File: backend/routes/khoaDashboard.js
 */

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const ctrl = require("../controllers/khoaDashboardController");

// GET /api/khoa/dashboard/stats
router.get("/stats", auth, ctrl.getStats);

// GET /api/khoa/dashboard/chart
router.get("/chart", auth, ctrl.getChartData);

// GET /api/khoa/dashboard/top-students
router.get("/top-students", auth, ctrl.getTopStudents);

// GET /api/khoa/dashboard/reports
router.get("/reports", auth, ctrl.getReports);

// POST /api/khoa/dashboard/notify
router.post("/notify", auth, ctrl.sendNotification);

module.exports = router;