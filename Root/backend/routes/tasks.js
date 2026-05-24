const express = require("express");
const router = express.Router();
const {
  getTasksByEvent,
  getClubMembersForAssign,
  createTask,
  reviewTask,
  deleteTask,
} = require("../controllers/taskController");
const { auth } = require("../middleware/auth");

router.get("/event/:eventId", auth, getTasksByEvent);
router.get("/club-members/:clubId", auth, getClubMembersForAssign);
router.post("/", auth, createTask);
router.patch("/:id/review", auth, reviewTask);
router.delete("/:id", auth, deleteTask);

module.exports = router;
