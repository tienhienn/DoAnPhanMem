const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getAllMembers,
  addMember,
  updateRole,
  removeMember,
  approveRequest,
  rejectRequest,
} = require("../controllers/memberController");

// Lấy danh sách thành viên
router.get("/", auth, getAllMembers);

// Quản lý thành viên trực tiếp
router.post("/", auth, addMember);
router.put("/:id/role", auth, updateRole);
router.delete("/:id", auth, removeMember);

// Xử lý đơn xin gia nhập (phải đặt TRƯỚC route /:id để tránh nhầm lẫn)
router.patch("/requests/:requestId/approve", auth, approveRequest);
router.patch("/requests/:requestId/reject", auth, rejectRequest);

module.exports = router;
