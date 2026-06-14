const { getPool } = require("../db/index");
const sql = require("mssql");

/**
 * GET /api/clubs
 * Lấy danh sách các câu lạc bộ (chỉ CLB đang Hoạt động)
 */
async function getAllClubs(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        c.MaCLB, c.TenCLB, c.MoTa, c.Logo, c.NgayThanhLap, c.LinhVuc, c.SoThanhVienToiDa, c.TrangThai,
        c.TenTiengAnh, c.TenVietTat, c.Slogan,
        (SELECT COUNT(*) FROM THANH_VIEN tv WHERE tv.MaCLB = c.MaCLB AND tv.TrangThai = N'Hoạt động') as SoThanhVienHienTai
      FROM CAULACBO c
      WHERE c.TrangThai = N'Hoạt động'
      ORDER BY c.TenCLB ASC
    `);

    return res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/clubs/:id
 * Xem chi tiết 1 CLB
 */
async function getClubById(req, res, next) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request().input("maCLB", sql.VarChar, id).query(`
        SELECT 
          c.MaCLB, c.TenCLB, c.MoTa, c.Logo, c.NgayThanhLap, c.LinhVuc, c.SoThanhVienToiDa, c.TrangThai,
          c.TenTiengAnh, c.TenVietTat, c.Slogan, c.TonChiMucDich, c.PhamViHoatDong, c.QuyenLoiTrachNhiem,
          (SELECT COUNT(*) FROM THANH_VIEN tv WHERE tv.MaCLB = c.MaCLB AND tv.TrangThai = N'Hoạt động') as SoThanhVienHienTai,
          (SELECT TOP 1 tk.hoTen FROM THANH_VIEN tv JOIN TAI_KHOAN tk ON tv.MaND = tk.MaND WHERE tv.MaCLB = c.MaCLB AND tv.VaiTroCLB = N'Chủ nhiệm' AND tv.TrangThai = N'Hoạt động') as TenChuNhiem
        FROM CAULACBO c
        WHERE c.MaCLB = @maCLB AND c.TrangThai = N'Hoạt động'  -- ✅ Thêm điều kiện này
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Câu lạc bộ không tồn tại hoặc đã ngừng hoạt động",
        });
    }

    return res.status(200).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    next(error);
  }
}
/**
 * GET /api/students/me/clubs
 * Lấy danh sách CLB mà sinh viên đang tham gia
 */
async function getMyClubs(req, res, next) {
  try {
    const maND = req.user.maND;
    const pool = await getPool();
    const result = await pool.request()
      .input('maND', sql.VarChar, maND)
      .query(`
        SELECT 
          c.MaCLB, c.TenCLB, c.Logo, c.LinhVuc, c.TrangThai,
          tv.VaiTroCLB, tv.NgayThamGia, tv.DiemDongGop, tv.TrangThai as TrangThaiTV
        FROM THANH_VIEN tv
        JOIN CAULACBO c ON tv.MaCLB = c.MaCLB
        WHERE tv.MaND = @maND AND tv.TrangThai = N'Hoạt động'
      `);
    // Trả về tất cả, kể cả CLB đã ngừng, để frontend xử lý hiển thị
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/clubs/:id/join
 * Gửi yêu cầu tham gia CLB
 */
async function joinClub(req, res, next) {
  try {
    const { id } = req.params;
    const maND = req.user.maND;
    const { lyDoThamGia } = req.body;

    const pool = await getPool();

    // Check if club exists and is active
    const clubResult = await pool
      .request()
      .input("maCLB", sql.VarChar, id)
      .query(
        "SELECT * FROM CAULACBO WHERE MaCLB = @maCLB AND TrangThai = N'Hoạt động'",
      );

    if (clubResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Câu lạc bộ không tồn tại hoặc không hoạt động",
      });
    }

    // Check if already a member
    const memberResult = await pool
      .request()
      .input("maCLB", sql.VarChar, id)
      .input("maND", sql.VarChar, maND)
      .query(
        "SELECT * FROM THANH_VIEN WHERE MaCLB = @maCLB AND MaND = @maND AND TrangThai = N'Hoạt động'",
      );

    if (memberResult.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã là thành viên của câu lạc bộ này",
      });
    }

    // Check if request already exists and is pending
    const requestResult = await pool
      .request()
      .input("maCLB", sql.VarChar, id)
      .input("maND", sql.VarChar, maND)
      .query(
        "SELECT * FROM YEU_CAU_THAM_GIA_CLB WHERE MaCLB = @maCLB AND MaSV = @maND AND TrangThai = 'cho_duyet'",
      );

    if (requestResult.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Bạn đã gửi yêu cầu tham gia câu lạc bộ này, vui lòng chờ duyệt",
      });
    }

    // Generate new MaYC
    const countResult = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM YEU_CAU_THAM_GIA_CLB");
    const count = countResult.recordset[0].count + 1;
    const maYC = `YC${count.toString().padStart(11, "0")}`;

    // Insert new request
    await pool
      .request()
      .input("maYC", sql.VarChar, maYC)
      .input("maCLB", sql.VarChar, id)
      .input("maSV", sql.VarChar, maND)
      .input("lyDo", sql.NVarChar, lyDoThamGia || "").query(`
        INSERT INTO YEU_CAU_THAM_GIA_CLB (MaYC, MaCLB, MaSV, LyDoThamGia, TrangThai, NgayNop)
        VALUES (@maYC, @maCLB, @maSV, @lyDo, 'cho_duyet', GETDATE())
      `);

    return res.status(201).json({
      success: true,
      message:
        "Gửi yêu cầu tham gia thành công, vui lòng chờ Ban chủ nhiệm duyệt",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/students/me/club-requests
 * Lấy danh sách yêu cầu tham gia CLB của tôi
 */
async function getMyClubRequests(req, res, next) {
  try {
    const maND = req.user.maND;
    const pool = await getPool();
    const result = await pool.request().input("maND", sql.VarChar, maND).query(`
        SELECT 
          yc.MaYC, yc.MaCLB, c.TenCLB, c.Logo, yc.LyDoThamGia, yc.NgayNop, yc.TrangThai, yc.LyDoTuChoi
        FROM YEU_CAU_THAM_GIA_CLB yc
        JOIN CAULACBO c ON yc.MaCLB = c.MaCLB
        WHERE yc.MaSV = @maND
        ORDER BY yc.NgayNop DESC
      `);

    return res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/clubs/:id/leave
 * Rời câu lạc bộ
 */
async function leaveClub(req, res, next) {
  try {
    const { id } = req.params;
    const maND = req.user.maND;

    const pool = await getPool();

    // Check if member is active in the club
    const memberResult = await pool
      .request()
      .input("maCLB", sql.VarChar, id)
      .input("maND", sql.VarChar, maND)
      .query(
        "SELECT * FROM THANH_VIEN WHERE MaCLB = @maCLB AND MaND = @maND AND TrangThai = N'Hoạt động'",
      );

    if (memberResult.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Bạn không phải là thành viên hoạt động của câu lạc bộ này",
      });
    }

    const member = memberResult.recordset[0];

    // Chủ nhiệm cannot leave without transferring leadership
    if (member.VaiTroCLB === "Chủ nhiệm") {
      return res.status(400).json({
        success: false,
        message:
          "Chủ nhiệm câu lạc bộ không thể rời CLB. Vui lòng chuyển giao vai trò trước.",
      });
    }

    // Update member status to 'Đã rời' and set NgayRoi
    await pool.request().input("maTV", sql.VarChar, member.MaTV).query(`
        UPDATE THANH_VIEN
        SET TrangThai = N'Đã rời', NgayRoi = GETDATE(), LyDoRoi = N'Sinh viên chủ động rời CLB'
        WHERE MaTV = @maTV
      `);

    return res.status(200).json({
      success: true,
      message: "Rời câu lạc bộ thành công",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllClubs,
  getClubById,
  getMyClubs,
  joinClub,
  getMyClubRequests,
  leaveClub,
};
