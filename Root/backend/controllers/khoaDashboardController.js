/**
 * khoaDashboardController - Dashboard tổng quan cho Cán bộ Khoa
 *
 * Chức năng:
 * - Thống kê nhanh (StatCard)
 * - Biểu đồ hoạt động 6 tháng
 * - Top 5 sinh viên tích cực
 * - Báo cáo CLB gần đây
 * - Gửi thông báo đến CLB
 */

const { getPool } = require("../db/index");
const sql = require("mssql");

// =====================================
// 1. GET /api/khoa/dashboard/stats
// Thống kê nhanh
// =====================================
exports.getStats = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        -- Tổng sự kiện đã được Khoa duyệt
        (SELECT COUNT(*) FROM SU_KIEN 
         WHERE TrangThai NOT IN ('draft', 'pending_faculty', 'rejected')
        ) AS TongSKDaDuyet,

        -- Tổng sinh viên tham gia sự kiện
        (SELECT COUNT(DISTINCT MaND) FROM DANGKY_SUKIEN
         WHERE TrangThai IN ('da_duyet', 'da_diem_danh')
        ) AS TongSinhVienThamGia,

        -- Tổng CLB đang hoạt động
        (SELECT COUNT(*) FROM CAULACBO 
         WHERE TrangThai = N'Hoạt động'
        ) AS TongCLBHoatDong,

        -- Báo cáo chờ duyệt
        (SELECT COUNT(*) FROM HOSO 
         WHERE TrangThai = 'submitted'
        ) AS BaoCaoChoDuyet
    `);

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê thành công",
      data: result.recordset[0],
    });
  } catch (err) {
    console.error("❌ Error getStats:", err);
    next(err);
  }
};

// =====================================
// 2. GET /api/khoa/dashboard/chart
// Biểu đồ hoạt động 6 tháng gần nhất
// =====================================
exports.getChartData = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        MONTH(sk.ThoiGianBatDau) AS Thang,
        YEAR(sk.ThoiGianBatDau)  AS Nam,
        COUNT(DISTINCT sk.MaSK)  AS SoSuKien,
        COUNT(dk.MaND)           AS SoSinhVienThamGia
      FROM SU_KIEN sk
      LEFT JOIN DANGKY_SUKIEN dk 
        ON sk.MaSK = dk.MaSK
        AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
      WHERE sk.ThoiGianBatDau >= DATEADD(MONTH, -6, GETDATE())
      GROUP BY MONTH(sk.ThoiGianBatDau), YEAR(sk.ThoiGianBatDau)
      ORDER BY Nam ASC, Thang ASC
    `);

    return res.status(200).json({
      success: true,
      message: "Lấy dữ liệu biểu đồ thành công",
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Error getChartData:", err);
    next(err);
  }
};

// =====================================
// 3. GET /api/khoa/dashboard/top-students
// Top 5 sinh viên tích cực nhất
// =====================================
exports.getTopStudents = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT TOP 5
        tk.MaND,
        tk.hoTen,
        tk.email,
        COUNT(dk.MaSK) AS SoSuKienThamGia,
        sv.diemRenLuyen
      FROM TAI_KHOAN tk
      INNER JOIN SINHVIEN sv ON tk.MaND = sv.maSV
      INNER JOIN DANGKY_SUKIEN dk ON tk.MaND = dk.MaND
        AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
      GROUP BY tk.MaND, tk.hoTen, tk.email, sv.diemRenLuyen
      ORDER BY SoSuKienThamGia DESC, sv.diemRenLuyen DESC
    `);

    return res.status(200).json({
      success: true,
      message: "Lấy top sinh viên thành công",
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Error getTopStudents:", err);
    next(err);
  }
};

// =====================================
// 4. GET /api/khoa/dashboard/reports
// Báo cáo CLB gần đây (5 cái mới nhất)
// =====================================
exports.getReports = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT TOP 5
        hs.MaHoSo,
        hs.maCLB,
        clb.TenCLB,
        hs.loaiHoSo,
        hs.TieuDe,
        hs.TrangThai,
        hs.NgayGui,
        hs.FileDinhKem
      FROM HOSO hs
      INNER JOIN CAULACBO clb ON hs.maCLB = clb.MaCLB
      ORDER BY hs.NgayGui DESC
    `);

    return res.status(200).json({
      success: true,
      message: "Lấy báo cáo thành công",
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Error getReports:", err);
    next(err);
  }
};

// =====================================
// 5. POST /api/khoa/dashboard/notify
// Gửi thông báo đến CLB
// =====================================
exports.sendNotification = async (req, res, next) => {
  try {
    const { role, maSV } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const { maCLB, tieuDe, noiDung, loaiTB } = req.body;

    if (!tieuDe || !noiDung) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề và nội dung là bắt buộc",
        data: null,
      });
    }

    const pool = await getPool();

    // Sinh MaTB mới
    const countResult = await pool.request().query(
      "SELECT COUNT(*) AS total FROM THONG_BAO"
    );
    const total = countResult.recordset[0].total + 1;
    const maTB = `TB${total.toString().padStart(9, "0")}`;

    await pool
      .request()
      .input("maTB",      sql.VarChar(13),   maTB)
      .input("maCLB",     sql.VarChar(13),   maCLB || null)
      .input("tieuDe",    sql.NVarChar(200),  tieuDe)
      .input("noiDung",   sql.NVarChar(sql.MAX), noiDung)
      .input("nguoiGui",  sql.VarChar(13),   maSV)
      .input("loaiTB",    sql.NVarChar(50),   loaiTB || "Thông báo")
      .query(`
        INSERT INTO THONG_BAO 
          (MaTB, MaCLB, TieuDe, NoiDung, idNguoiGui, LoaiTB, NgayGui, TrangThai)
        VALUES
          (@maTB, @maCLB, @tieuDe, @noiDung, @nguoiGui, @loaiTB, GETDATE(), 'da_gui')
      `);

    return res.status(201).json({
      success: true,
      message: maCLB ? "Gửi thông báo đến CLB thành công" : "Gửi thông báo đến tất cả CLB thành công",
      data: { maTB, tieuDe, maCLB: maCLB || "all" },
    });
  } catch (err) {
    console.error("❌ Error sendNotification:", err);
    next(err);
  }
};