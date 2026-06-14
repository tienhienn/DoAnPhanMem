const { getPool, sql } = require("../db");

// Helper: Lấy CLB của người dùng hiện tại (BCN)
const getClubOfUser = async (pool, maND) => {
  const result = await pool.request().input("MaND", sql.VarChar, maND)
    .query(`
      SELECT MaCLB FROM THANH_VIEN 
      WHERE MaND = @MaND AND TrangThai = N'Hoạt động'
    `);
  return result.recordset.length > 0 ? result.recordset[0].MaCLB : null;
};

// Helper: Lấy danh sách Khoa
const getKhoas = async (pool) => {
  const result = await pool.request().query(`
    SELECT maKhoa as id, tenKhoa as name FROM Khoa ORDER BY tenKhoa
  `);
  return result.recordset;
};

// Helper: Lấy danh sách Lớp theo Khoa
const getLopsByKhoa = async (pool, maKhoa) => {
  const result = await pool.request().input("MaKhoa", sql.VarChar, maKhoa)
    .query(`
      SELECT maLop as id, tenLop as name FROM Lop 
      WHERE maKhoa = @MaKhoa ORDER BY tenLop
    `);
  return result.recordset;
};

// Helper: Lấy danh sách Sinh viên theo Lớp (chỉ những sinh viên chưa là thành viên của CLB)
const getSinhVienByLop = async (pool, maLop, maCLB) => {
  const result = await pool.request()
    .input("MaLop", sql.VarChar, maLop)
    .input("MaCLB", sql.VarChar, maCLB)
    .query(`
      SELECT DISTINCT
        SV.maSV as id, TK.hoTen as name, TK.MaND as mssv
      FROM SINHVIEN SV
      INNER JOIN TAI_KHOAN TK ON SV.maSV = TK.MaND
      WHERE SV.maLop = @MaLop 
        AND SV.maSV NOT IN (
          SELECT MaND FROM THANH_VIEN WHERE MaCLB = @MaCLB AND TrangThai = N'Hoạt động'
        )
      ORDER BY TK.hoTen
    `);
  return result.recordset;
};

// Helper: Sinh mã Thành Viên (MaTV) tự động tăng
const generateMaTV = async (pool) => {
  const result = await pool
    .request()
    .query(
      `SELECT TOP 1 MaTV FROM THANH_VIEN WHERE MaTV LIKE 'TV%' ORDER BY MaTV DESC`,
    );
  if (result.recordset.length === 0) return "TV000000001";
  const lastNum = parseInt(result.recordset[0].MaTV.replace("TV", ""), 10);
  return `TV${String(lastNum + 1).padStart(9, "0")}`;
};

// 1. Lấy toàn bộ danh sách nhân sự (Bao gồm Thành viên, Đã rời, và Đơn xin gia nhập)
const getAllMembers = async (req, res, next) => {
  try {
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);
    if (!MaCLB)
      return res
        .status(403)
        .json({
          success: false,
          error: { message: "Bạn không có quyền quản lý CLB này" },
        });

    const result = await pool.request().input("MaCLB", sql.VarChar, MaCLB)
      .query(`
        -- Lấy thành viên đang hoạt động và đã rời
        SELECT 
            TV.MaTV as id, TK.hoTen as name, TK.MaND as mssv, 
            TV.VaiTroCLB as role, TV.NgayThamGia as joinDate, 
            TV.DiemDongGop as contribution, 
            CASE WHEN TV.TrangThai = N'Hoạt động' THEN 'active' ELSE 'left' END as status
        FROM THANH_VIEN TV
        INNER JOIN TAI_KHOAN TK ON TV.MaND = TK.MaND
        WHERE TV.MaCLB = @MaCLB
        
        UNION ALL
        
        -- Lấy đơn xin gia nhập (chờ duyệt)
        SELECT 
            YC.MaYC as id, TK.hoTen as name, TK.MaND as mssv, 
            N'Thành viên' as role, YC.NgayNop as joinDate, 
            0 as contribution, 
            'pending' as status
        FROM YEU_CAU_THAM_GIA_CLB YC
        INNER JOIN TAI_KHOAN TK ON YC.MaSV = TK.MaND
        WHERE YC.MaCLB = @MaCLB AND YC.TrangThai = 'cho_duyet'
      `);

    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// 2. Thêm thành viên trực tiếp vào CLB
const addMember = async (req, res, next) => {
  try {
    const { mssv, role } = req.body;
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);

    // Kiểm tra sinh viên có tồn tại trong hệ thống (TAI_KHOAN) không
    const userCheck = await pool
      .request()
      .input("MaND", sql.VarChar, mssv)
      .query(`SELECT MaND FROM TAI_KHOAN WHERE MaND = @MaND`);
    if (userCheck.recordset.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          error: { message: "Sinh viên không tồn tại trên hệ thống!" },
        });
    }

    // Kiểm tra xem đã trong CLB chưa
    const memberCheck = await pool
      .request()
      .input("MaND", sql.VarChar, mssv)
      .input("MaCLB", sql.VarChar, MaCLB)
      .query(
        `SELECT TrangThai FROM THANH_VIEN WHERE MaND = @MaND AND MaCLB = @MaCLB`,
      );

    if (memberCheck.recordset.length > 0) {
      if (memberCheck.recordset[0].TrangThai === "Hoạt động") {
        return res
          .status(400)
          .json({
            success: false,
            error: { message: "Sinh viên này đã là thành viên của CLB!" },
          });
      } else {
        // Đã từng rời CLB -> Cập nhật lại thành Hoạt động
        await pool
          .request()
          .input("MaND", sql.VarChar, mssv)
          .input("MaCLB", sql.VarChar, MaCLB)
          .input("VaiTro", sql.NVARCHAR(50), role)
          .query(
            `UPDATE THANH_VIEN SET TrangThai = N'Hoạt động', VaiTroCLB = @VaiTro, NgayThamGia = GETDATE(), NgayRoi = NULL WHERE MaND = @MaND AND MaCLB = @MaCLB`,
          );
        return res
          .status(200)
          .json({
            success: true,
            message: "Đã thêm lại thành viên cũ vào CLB.",
          });
      }
    }

    // Thêm mới hoàn toàn
    const MaTV = await generateMaTV(pool);
    await pool
      .request()
      .input("MaTV", sql.VarChar, MaTV)
      .input("MaCLB", sql.VarChar, MaCLB)
      .input("MaND", sql.VarChar, mssv)
      .input("VaiTro", sql.NVARCHAR(50), role)
      .input("NgayThamGia", sql.Date, new Date())
      .input("TrangThai", sql.NVARCHAR(50), "Hoạt động").query(`
        INSERT INTO THANH_VIEN (MaTV, MaCLB, MaND, VaiTroCLB, NgayThamGia, TrangThai)
        VALUES (@MaTV, @MaCLB, @MaND, @VaiTro, @NgayThamGia, @TrangThai)
      `);

    res
      .status(201)
      .json({ success: true, message: "Thêm thành viên thành công." });
  } catch (err) {
    next(err);
  }
};

// 3. Sửa chức vụ thành viên
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params; // MaTV
    const { role } = req.body;
    const pool = await getPool();
    await pool
      .request()
      .input("MaTV", sql.VarChar, id)
      .input("VaiTro", sql.NVARCHAR(50), role)
      .query(`UPDATE THANH_VIEN SET VaiTroCLB = @VaiTro WHERE MaTV = @MaTV`);
    res
      .status(200)
      .json({ success: true, message: "Cập nhật chức vụ thành công." });
  } catch (err) {
    next(err);
  }
};

// 4. Xóa thành viên (Cập nhật trạng thái thành Đã rời)
const removeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    await pool
      .request()
      .input("MaTV", sql.VarChar, id)
      .query(
        `UPDATE THANH_VIEN SET TrangThai = N'Đã rời', NgayRoi = GETDATE() WHERE MaTV = @MaTV`,
      );
    res
      .status(200)
      .json({ success: true, message: "Đã xóa thành viên khỏi CLB." });
  } catch (err) {
    next(err);
  }
};

// 5. Duyệt đơn xin gia nhập
const approveRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params; // MaYC
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);

    // Lấy MSSV từ đơn
    const reqData = await pool
      .request()
      .input("MaYC", sql.VarChar, requestId)
      .query(`SELECT MaSV FROM YEU_CAU_THAM_GIA_CLB WHERE MaYC = @MaYC`);
    if (reqData.recordset.length === 0)
      return res
        .status(404)
        .json({ success: false, error: { message: "Không tìm thấy đơn." } });

    const MaND = reqData.recordset[0].MaSV;
    const MaTV = await generateMaTV(pool);

    // Chuyển vào THANH_VIEN và cập nhật Đơn
    await pool
      .request()
      .input("MaTV", sql.VarChar, MaTV)
      .input("MaCLB", sql.VarChar, MaCLB)
      .input("MaND", sql.VarChar, MaND)
      .input("NguoiDuyet", sql.VarChar, req.user.maND)
      .input("MaYC", sql.VarChar, requestId).query(`
        INSERT INTO THANH_VIEN (MaTV, MaCLB, MaND, VaiTroCLB, NgayThamGia, TrangThai)
        VALUES (@MaTV, @MaCLB, @MaND, N'Thành viên', GETDATE(), N'Hoạt động');

        UPDATE YEU_CAU_THAM_GIA_CLB SET TrangThai = 'da_duyet', NgayDuyet = GETDATE(), NguoiDuyetID = @NguoiDuyet WHERE MaYC = @MaYC;
      `);

    res.status(200).json({ success: true, message: "Đã duyệt đơn gia nhập." });
  } catch (err) {
    next(err);
  }
};

// 6. Từ chối đơn xin gia nhập
const rejectRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const pool = await getPool();
    await pool
      .request()
      .input("MaYC", sql.VarChar, requestId)
      .input("NguoiDuyet", sql.VarChar, req.user.maND)
      .query(
        `UPDATE YEU_CAU_THAM_GIA_CLB SET TrangThai = 'tu_choi', NgayDuyet = GETDATE(), NguoiDuyetID = @NguoiDuyet WHERE MaYC = @MaYC`,
      );
    res
      .status(200)
      .json({ success: true, message: "Đã từ chối đơn gia nhập." });
  } catch (err) {
    next(err);
  }
};

// 7. Lấy danh sách Khoa
const getKhoaList = async (req, res, next) => {
  try {
    const pool = await getPool();
    const khoas = await getKhoas(pool);
    res.status(200).json({ success: true, data: khoas });
  } catch (err) {
    next(err);
  }
};

// 8. Lấy danh sách Lớp theo Khoa
const getLopList = async (req, res, next) => {
  try {
    const { maKhoa } = req.params;
    const pool = await getPool();
    const lops = await getLopsByKhoa(pool, maKhoa);
    res.status(200).json({ success: true, data: lops });
  } catch (err) {
    next(err);
  }
};

// 9. Lấy danh sách Sinh viên theo Lớp
const getSinhVienList = async (req, res, next) => {
  try {
    const { maLop } = req.params;
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);
    if (!MaCLB)
      return res
        .status(403)
        .json({
          success: false,
          error: { message: "Bạn không có quyền quản lý CLB này" },
        });

    const sinhViens = await getSinhVienByLop(pool, maLop, MaCLB);
    res.status(200).json({ success: true, data: sinhViens });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMembers,
  addMember,
  updateRole,
  removeMember,
  approveRequest,
  rejectRequest,
  getKhoaList,
  getLopList,
  getSinhVienList,
};
