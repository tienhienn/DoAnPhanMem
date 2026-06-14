/**
 * khoaClubController - Cán bộ Khoa quản lý CLB
 * ✅ Chỉ xem/quản lý CLB thuộc đơn vị của mình
 */

const { getPool } = require("../db/index");
const sql = require("mssql");

// ── Helper: Lấy maDVQL của CB đang đăng nhập ─────────────
async function getMaDVQL(pool, maND) {
  const result = await pool
    .request()
    .input("maND", sql.VarChar, maND)
    .query(`SELECT maDVQL FROM CANBO WHERE maCanBo = @maND`);
  return result.recordset[0]?.maDVQL || null;
}

// =====================================
// 1. GET /api/khoa/clubs
// =====================================
exports.getClubs = async (req, res, next) => {
  try {
    const { role, maSV } = req.user;

    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Chỉ Cán bộ Khoa mới có quyền xem danh sách CLB",
      });
    }

    const { search, status } = req.query;
    const pool = await getPool();

    const maDVQL = await getMaDVQL(pool, maSV);
    if (!maDVQL) {
      return res.status(403).json({
        success: false,
        message: "Không tìm thấy thông tin cán bộ",
      });
    }

    const request = pool.request();
    request.input("maDVQL", sql.VarChar, maDVQL);

    let query = `
      SELECT
        c.MaCLB, c.TenCLB, c.MoTa, c.LinhVuc, c.NgayThanhLap,
        c.SoThanhVienToiDa, c.TrangThai,
        (SELECT COUNT(*) FROM THANH_VIEN tv WHERE tv.MaCLB = c.MaCLB AND tv.TrangThai = N'Hoạt động') AS SoThanhVien,
        (SELECT COUNT(*) FROM SU_KIEN sk WHERE sk.MaCLB = c.MaCLB) AS SoSuKien,
        (
          SELECT TOP 1 tk.hoTen FROM THANH_VIEN tv
          JOIN TAI_KHOAN tk ON tv.MaND = tk.MaND
          WHERE tv.MaCLB = c.MaCLB AND tv.VaiTroCLB = N'Chủ nhiệm' AND tv.TrangThai = N'Hoạt động'
        ) AS TenChuNhiem
      FROM CAULACBO c
      WHERE c.maDVQL = @maDVQL
    `;

    if (search) {
      query += ` AND (c.TenCLB LIKE @search OR c.LinhVuc LIKE @search)`;
      request.input("search", sql.NVarChar, `%${search}%`);
    }

    if (status) {
      query += ` AND c.TrangThai = @status`;
      request.input("status", sql.NVarChar, status);
    }

    query += ` ORDER BY c.TenCLB ASC`;

    const result = await request.query(query);

    return res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// =====================================
// 2. GET /api/khoa/clubs/:id
// =====================================
exports.getClubDetail = async (req, res, next) => {
  try {
    const { role, maSV } = req.user;
    const { id } = req.params;

    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Chỉ Cán bộ Khoa mới có quyền xem chi tiết CLB",
        data: null,
      });
    }

    const pool = await getPool();

    // Kiểm tra CB có quyền xem CLB này không
    const maDVQL = await getMaDVQL(pool, maSV);
    if (!maDVQL) {
      return res.status(403).json({
        success: false,
        message: "Không tìm thấy thông tin cán bộ",
        data: null,
      });
    }

    const checkClub = await pool
      .request()
      .input("maCLBCheck", sql.VarChar, id)
      .input("maDVQLCheck", sql.VarChar, maDVQL)
      .query(`
        SELECT MaCLB FROM CAULACBO 
        WHERE MaCLB = @maCLBCheck AND maDVQL = @maDVQLCheck
      `);

    if (checkClub.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        message: "CLB này không thuộc đơn vị của bạn",
        data: null,
      });
    }

    // Thông tin CLB
    const clubResult = await pool
      .request()
      .input("maCLB", sql.VarChar, id)
      .query(`
        SELECT
          c.MaCLB, c.TenCLB, c.MoTa, c.LinhVuc,
          c.NgayThanhLap, c.SoThanhVienToiDa, c.TrangThai,
          (SELECT COUNT(*) FROM THANH_VIEN tv WHERE tv.MaCLB = c.MaCLB AND tv.TrangThai = N'Hoạt động') AS SoThanhVien,
          (SELECT COUNT(*) FROM SU_KIEN sk WHERE sk.MaCLB = c.MaCLB) AS SoSuKien
        FROM CAULACBO c
        WHERE c.MaCLB = @maCLB
      `);

    if (clubResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy CLB",
        data: null,
      });
    }

    // Ban chủ nhiệm
    const bcnResult = await pool
      .request()
      .input("maCLB2", sql.VarChar, id)
      .query(`
        SELECT tv.MaTV, tv.VaiTroCLB, tv.NgayThamGia,
               tk.hoTen, tk.email, tk.soDienThoai
        FROM THANH_VIEN tv
        JOIN TAI_KHOAN tk ON tv.MaND = tk.MaND
        WHERE tv.MaCLB = @maCLB2
          AND tv.TrangThai = N'Hoạt động'
          AND tv.VaiTroCLB IN (N'Chủ nhiệm', N'Phó chủ nhiệm')
        ORDER BY tv.VaiTroCLB ASC
      `);

    // Sự kiện gần đây
    const eventResult = await pool
      .request()
      .input("maCLB3", sql.VarChar, id)
      .query(`
        SELECT TOP 5 MaSK, TenSK, ThoiGianBatDau, TrangThai
        FROM SU_KIEN
        WHERE MaCLB = @maCLB3
        ORDER BY NgayTao DESC
      `);

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết CLB thành công",
      data: {
        ...clubResult.recordset[0],
        BanChuNhiem: bcnResult.recordset,
        SuKienGanDay: eventResult.recordset,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching club detail:", err);
    next(err);
  }
};

// =====================================
// 3. PATCH /api/khoa/clubs/:id/status
// =====================================
exports.updateClubStatus = async (req, res, next) => {
  try {
    const { role, maSV } = req.user;
    const { id } = req.params;
    const { status, lyDo } = req.body;

    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Chỉ Cán bộ Khoa mới có quyền thay đổi trạng thái CLB",
        data: null,
      });
    }

    const validStatuses = ["Hoạt động", "Bị khóa", "Không hoạt động"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Các giá trị cho phép: ${validStatuses.join(", ")}`,
        data: null,
      });
    }

    const pool = await getPool();

    // Kiểm tra CB có quyền với CLB này không
    const maDVQL = await getMaDVQL(pool, maSV);
    if (!maDVQL) {
      return res.status(403).json({
        success: false,
        message: "Không tìm thấy thông tin cán bộ",
        data: null,
      });
    }

    const checkResult = await pool
      .request()
      .input("maCLB", sql.VarChar, id)
      .input("maDVQL", sql.VarChar, maDVQL)
      .query(`
        SELECT MaCLB, TenCLB, TrangThai FROM CAULACBO 
        WHERE MaCLB = @maCLB AND maDVQL = @maDVQL
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        message: "CLB này không thuộc đơn vị của bạn hoặc không tồn tại",
        data: null,
      });
    }

    const club = checkResult.recordset[0];

    await pool
      .request()
      .input("maCLB2", sql.VarChar, id)
      .input("status", sql.NVarChar(50), status)
      .query(`UPDATE CAULACBO SET TrangThai = @status WHERE MaCLB = @maCLB2`);

    return res.status(200).json({
      success: true,
      message: `CLB "${club.TenCLB}" đã được cập nhật trạng thái thành "${status}"`,
      data: {
        maCLB: id,
        tenCLB: club.TenCLB,
        trangThaiCu: club.TrangThai,
        trangThaiMoi: status,
        lyDo: lyDo || null,
      },
    });
  } catch (err) {
    console.error("❌ Error updating club status:", err);
    next(err);
  }
};