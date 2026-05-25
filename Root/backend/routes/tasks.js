const express = require("express");
const router = express.Router();
const {
  getTasksByEvent,
  getClubMembersForAssign,
  createTask,
  reviewTask,
  deleteTask,
  getStudentTasks,
  submitTaskReport,
} = require("../controllers/taskController");
const { auth } = require("../middleware/auth");

// 1. IMPORT MIDDLEWARE UPLOAD
const upload = require("../middleware/upload");

// Middleware xử lý lỗi multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: err.message || "Lỗi khi tải file lên",
      },
    });
  }
  next();
};

// ========== BCN ROUTES ==========
router.get("/event/:eventId", auth, getTasksByEvent);
router.get("/club-members/:clubId", auth, getClubMembersForAssign);
router.post("/", auth, upload.single("file"), handleMulterError, createTask);
router.patch("/:id/review", auth, reviewTask);
router.delete("/:id", auth, deleteTask);

// ========== STUDENT ROUTES ==========
router.get("/student/my-tasks", auth, getStudentTasks);
router.patch(
  "/:id/submit",
  auth,
  upload.single("file"),
  handleMulterError,
  submitTaskReport,
);

module.exports = router;
