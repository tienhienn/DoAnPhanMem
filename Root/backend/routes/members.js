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
  getKhoaList,
  getLopList,
  getSinhVienList,
} = require("../controllers/memberController");

// ⚠️ QUAN TRỌNG: Các route cụ thể phải đặt TRƯỚC các route tham số
// Express xử lý routes theo thứ tự, nên route cụ thể phải đặt trước

// 1. Lấy danh sách Khoa (GET /khoas)
router.get("/khoas", auth, getKhoaList);

// 2. Lấy danh sách Lớp theo Khoa (GET /khoas/:maKhoa/lops)
router.get("/khoas/:maKhoa/lops", auth, getLopList);

// 3. Lấy danh sách Sinh viên theo Lớp (GET /lops/:maLop/sinhviens)
router.get("/lops/:maLop/sinhviens", auth, getSinhVienList);

// 4. Duyệt đơn xin gia nhập (PATCH /requests/:requestId/approve)
router.patch("/requests/:requestId/approve", auth, approveRequest);

// 5. Từ chối đơn xin gia nhập (PATCH /requests/:requestId/reject)
router.patch("/requests/:requestId/reject", auth, rejectRequest);

// 6. Lấy danh sách thành viên (GET /)
router.get("/", auth, getAllMembers);

// 7. Thêm thành viên (POST /)
router.post("/", auth, addMember);

// 8. Sửa chức vụ thành viên (PUT /:id/role)
router.put("/:id/role", auth, updateRole);

// 9. Xóa thành viên (DELETE /:id)
router.delete("/:id", auth, removeMember);

module.exports = router;
