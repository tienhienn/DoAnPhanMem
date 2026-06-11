/**
 * khoaDashboardController - Dashboard tổng quan cho Cán bộ Khoa
 * ✅ Chỉ hiển thị dữ liệu thuộc đơn vị của CB đang đăng nhập
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
// 1. GET /api/khoa/dashboard/stats
// =====================================
exports.getStats = async (req, res, next) => {
  try {
    const { role, maSV } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const pool = await getPool();

    const maDVQL = await getMaDVQL(pool, maSV);
    if (!maDVQL) {
      return res.status(403).json({ success: false, message: "Không tìm thấy thông tin cán bộ", data: null });
    }

    const result = await pool
      .request()
      .input("maDVQL", sql.VarChar, maDVQL)
      .query(`
        SELECT
          -- Tổng SK của CLB thuộc đơn vị đã được duyệt
          (
            SELECT COUNT(*) FROM SU_KIEN sk
            INNER JOIN CAULACBO c ON sk.MaCLB = c.MaCLB
            WHERE c.maDVQL = @maDVQL
              AND sk.TrangThai NOT IN ('draft', 'pending_faculty', 'rejected')
          ) AS TongSKDaDuyet,

          -- Tổng SV tham gia SK của CLB thuộc đơn vị
          (
            SELECT COUNT(DISTINCT dk.MaND) FROM DANGKY_SUKIEN dk
            INNER JOIN SU_KIEN sk ON dk.MaSK = sk.MaSK
            INNER JOIN CAULACBO c ON sk.MaCLB = c.MaCLB
            WHERE c.maDVQL = @maDVQL
              AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
          ) AS TongSinhVienThamGia,

          -- Tổng CLB thuộc đơn vị đang hoạt động
          (
            SELECT COUNT(*) FROM CAULACBO
            WHERE maDVQL = @maDVQL AND TrangThai = N'Hoạt động'
          ) AS TongCLBHoatDong,

          -- Báo cáo chờ duyệt của CLB thuộc đơn vị
          (
            SELECT COUNT(*) FROM HOSO hs
            INNER JOIN CAULACBO c ON hs.maCLB = c.MaCLB
            WHERE c.maDVQL = @maDVQL AND hs.TrangThai = 'submitted'
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
// =====================================
exports.getChartData = async (req, res, next) => {
  try {
    const { role, maSV } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const pool = await getPool();

    const maDVQL = await getMaDVQL(pool, maSV);
    if (!maDVQL) {
      return res.status(403).json({ success: false, message: "Không tìm thấy thông tin cán bộ", data: null });
    }

    const result = await pool
      .request()
      .input("maDVQL", sql.VarChar, maDVQL)
      .query(`
        SELECT
          MONTH(sk.ThoiGianBatDau) AS Thang,
          YEAR(sk.ThoiGianBatDau)  AS Nam,
          COUNT(DISTINCT sk.MaSK)  AS SoSuKien,
          COUNT(dk.MaND)           AS SoSinhVienThamGia
        FROM SU_KIEN sk
        INNER JOIN CAULACBO c ON sk.MaCLB = c.MaCLB
        LEFT JOIN DANGKY_SUKIEN dk
          ON sk.MaSK = dk.MaSK
          AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
        WHERE c.maDVQL = @maDVQL
          AND sk.ThoiGianBatDau >= DATEADD(MONTH, -6, GETDATE())
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
// =====================================
exports.getTopStudents = async (req, res, next) => {
  try {
    const { role, maSV } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const pool = await getPool();

    const maDVQL = await getMaDVQL(pool, maSV);
    if (!maDVQL) {
      return res.status(403).json({ success: false, message: "Không tìm thấy thông tin cán bộ", data: null });
    }

    const result = await pool
      .request()
      .input("maDVQL", sql.VarChar, maDVQL)
      .query(`
        SELECT TOP 5
          tk.MaND,
          tk.hoTen,
          tk.email,
          COUNT(dk.MaSK)   AS SoSuKienThamGia,
          sv.diemRenLuyen
        FROM TAI_KHOAN tk
        INNER JOIN SINHVIEN sv ON tk.MaND = sv.maSV
        INNER JOIN DANGKY_SUKIEN dk ON tk.MaND = dk.MaND
          AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
        INNER JOIN SU_KIEN sk ON dk.MaSK = sk.MaSK
        INNER JOIN CAULACBO c ON sk.MaCLB = c.MaCLB
        WHERE c.maDVQL = @maDVQL
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
// =====================================
exports.getReports = async (req, res, next) => {
  try {
    const { role, maSV } = req.user;
    if (role !== "KHOA" && role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập", data: null });
    }

    const pool = await getPool();

    const maDVQL = await getMaDVQL(pool, maSV);
    if (!maDVQL) {
      return res.status(403).json({ success: false, message: "Không tìm thấy thông tin cán bộ", data: null });
    }

    const result = await pool
      .request()
      .input("maDVQL", sql.VarChar, maDVQL)
      .query(`
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
        WHERE clb.maDVQL = @maDVQL
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

    // Kiểm tra nếu gửi đến CLB cụ thể thì CLB đó phải thuộc đơn vị
    if (maCLB) {
      const maDVQL = await getMaDVQL(pool, maSV);
      const checkClub = await pool
        .request()
        .input("maCLBCheck", sql.VarChar, maCLB)
        .input("maDVQLCheck", sql.VarChar, maDVQL)
        .query(`SELECT MaCLB FROM CAULACBO WHERE MaCLB = @maCLBCheck AND maDVQL = @maDVQLCheck`);

      if (checkClub.recordset.length === 0) {
        return res.status(403).json({
          success: false,
          message: "CLB này không thuộc đơn vị của bạn",
          data: null,
        });
      }
    }

    // Sinh MaTB mới
      const countResult = await pool.request().query("SELECT COUNT(*) AS total FROM THONG_BAO");
      const total = countResult.recordset[0].total + 1;
      const maTB = `TB${total.toString().padStart(9, "0")}`;

      // Insert vào THONG_BAO
      await pool
        .request()
        .input("maTB",     sql.VarChar(13),       maTB)
        .input("maCLB",    sql.VarChar(13),        maCLB || null)
        .input("tieuDe",   sql.NVarChar(200),      tieuDe)
        .input("noiDung",  sql.NVarChar(sql.MAX),  noiDung)
        .input("nguoiGui", sql.VarChar(13),        maSV)
        .input("loaiTB",   sql.NVarChar(50),       loaiTB || "Thông báo")
        .query(`
          INSERT INTO THONG_BAO (MaTB, MaCLB, TieuDe, NoiDung, idNguoiGui, LoaiTB, NgayGui, TrangThai)
          VALUES (@maTB, @maCLB, @tieuDe, @noiDung, @nguoiGui, @loaiTB, GETDATE(), 'da_gui')
        `);

      // Lấy danh sách thành viên CLB cần nhận thông báo
      let membersQuery;
      if (maCLB) {
        // Gửi đến CLB cụ thể
        membersQuery = await pool
          .request()
          .input("maCLBMember", sql.VarChar(13), maCLB)
          .query(`
            SELECT DISTINCT MaND FROM THANH_VIEN
            WHERE MaCLB = @maCLBMember AND TrangThai = N'Hoạt động'
          `);
      } else {
        // Gửi đến tất cả CLB thuộc đơn vị
        const maDVQL = await getMaDVQL(pool, maSV);
        membersQuery = await pool
          .request()
          .input("maDVQLMember", sql.VarChar(13), maDVQL)
          .query(`
            SELECT DISTINCT tv.MaND FROM THANH_VIEN tv
            INNER JOIN CAULACBO c ON tv.MaCLB = c.MaCLB
            WHERE c.maDVQL = @maDVQLMember AND tv.TrangThai = N'Hoạt động'
          `);
      }

      // Insert vào THONG_BAO_NGUOIDUNG cho từng thành viên
      for (const member of membersQuery.recordset) {
        await pool
          .request()
          .input("maTBnd",  sql.VarChar(13), maTB)
          .input("maND",    sql.VarChar, member.MaND)
          .query(`
            INSERT INTO THONG_BAO_NGUOIDUNG (MaTB, MaND, DaDoc)
            VALUES (@maTBnd, @maND, 0)
          `);
      }

      return res.status(201).json({
        success: true,
        message: maCLB ? "Gửi thông báo đến CLB thành công" : "Gửi thông báo đến tất cả CLB thành công",
        data: {
          maTB,
          tieuDe,
          maCLB: maCLB || "all",
          soNguoiNhan: membersQuery.recordset.length,
        },
      });
  } catch (err) {
    console.error("❌ Error sendNotification:", err);
    next(err);
  }
};