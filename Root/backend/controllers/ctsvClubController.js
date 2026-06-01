const { getPool, sql } = require("../db");

/**
 * Danh sách CLB đã thành lập (đang hoạt động)
 * GET /api/ctsv/clubs/established
 */
const getEstablishedClubs = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        c.MaCLB,
        c.TenCLB,
        c.MoTa,
        c.Logo,
        c.LinhVuc,
        c.NgayThanhLap,
        c.TrangThai,
        dv.tenDVQL,
        (
          SELECT COUNT(*) FROM THANH_VIEN tv
          WHERE tv.MaCLB = c.MaCLB AND tv.TrangThai = N'Hoạt động'
        ) AS SoThanhVien,
        (
          SELECT TOP 1 tk.hoTen FROM THANH_VIEN tv
          JOIN TAI_KHOAN tk ON tv.MaND = tk.MaND
          WHERE tv.MaCLB = c.MaCLB
            AND tv.VaiTroCLB = N'Chủ nhiệm'
            AND tv.TrangThai = N'Hoạt động'
        ) AS TenChuNhiem
      FROM CAULACBO c
      LEFT JOIN DONVIQUANLY dv ON c.maDVQL = dv.maDVQL
      WHERE c.TrangThai = N'Hoạt động'
      ORDER BY c.TenCLB ASC
    `);

    res.status(200).json({
      success: true,
      data: result.recordset || [],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Chi tiết CLB + thống kê hoạt động
 * GET /api/ctsv/clubs/:id/detail
 */
const getClubDetailForCTSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const clubResult = await pool
      .request()
      .input("MaCLB", sql.NVarChar, id)
      .query(`
        SELECT
          c.MaCLB,
          c.TenCLB,
          c.MoTa,
          c.Logo,
          c.LinhVuc,
          c.NgayThanhLap,
          c.SoThanhVienToiDa,
          c.TrangThai,
          c.TenTiengAnh,
          c.TenVietTat,
          c.Slogan,
          c.TonChiMucDich,
          c.PhamViHoatDong,
          dv.tenDVQL,
          (
            SELECT COUNT(*) FROM THANH_VIEN tv
            WHERE tv.MaCLB = c.MaCLB AND tv.TrangThai = N'Hoạt động'
          ) AS SoThanhVien,
          (
            SELECT COUNT(*) FROM THANH_VIEN tv
            WHERE tv.MaCLB = c.MaCLB
              AND tv.TrangThai = N'Hoạt động'
              AND (
                tv.VaiTroCLB LIKE N'%ban%'
                OR tv.VaiTroCLB IN (N'Chủ nhiệm', N'Phó chủ nhiệm')
              )
          ) AS SoBanTruc,
          (
            SELECT COUNT(*) FROM SU_KIEN sk WHERE sk.MaCLB = c.MaCLB
          ) AS TongSuKien,
          (
            SELECT COUNT(*) FROM SU_KIEN sk
            WHERE sk.MaCLB = c.MaCLB
              AND sk.TrangThai IN (N'da_duyet', N'sap_dien_ra', N'dang_dien_ra', N'da_ket_thuc')
          ) AS SuKienDaDuyet,
          (
            SELECT COUNT(*) FROM SU_KIEN sk
            WHERE sk.MaCLB = c.MaCLB AND sk.TrangThai = N'da_ket_thuc'
          ) AS SuKienDaKetThuc
        FROM CAULACBO c
        LEFT JOIN DONVIQUANLY dv ON c.maDVQL = dv.maDVQL
        WHERE c.MaCLB = @MaCLB
      `);

    if (!clubResult.recordset.length) {
      return res.status(404).json({
        success: false,
        error: { message: "Không tìm thấy câu lạc bộ" },
      });
    }

    const banResult = await pool
      .request()
      .input("MaCLB2", sql.NVarChar, id)
      .query(`
        SELECT tv.VaiTroCLB, COUNT(*) AS SoLuong
        FROM THANH_VIEN tv
        WHERE tv.MaCLB = @MaCLB2
          AND tv.TrangThai = N'Hoạt động'
          AND tv.VaiTroCLB LIKE N'%ban%'
        GROUP BY tv.VaiTroCLB
        ORDER BY tv.VaiTroCLB
      `);

    const eventResult = await pool
      .request()
      .input("MaCLB3", sql.NVarChar, id)
      .query(`
        SELECT TOP 5 MaSK, TenSK, ThoiGianBatDau, TrangThai
        FROM SU_KIEN
        WHERE MaCLB = @MaCLB3
        ORDER BY ThoiGianBatDau DESC
      `);

    res.status(200).json({
      success: true,
      data: {
        ...clubResult.recordset[0],
        DanhSachBan: banResult.recordset || [],
        SuKienGanDay: eventResult.recordset || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Danh sách thành viên CLB
 * GET /api/ctsv/clubs/:id/members
 */
const getClubMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("MaCLB", sql.NVarChar, id)
      .query(`
        SELECT
          RTRIM(tk.MaND) AS maSV,
          tk.hoTen,
          tk.email,
          tk.soDienThoai,
          l.tenLop,
          k.tenKhoa,
          tv.VaiTroCLB,
          tv.NgayThamGia,
          tv.TrangThai,
          tv.DiemDongGop
        FROM THANH_VIEN tv
        INNER JOIN TAI_KHOAN tk ON tv.MaND = tk.MaND
        LEFT JOIN SINHVIEN sv ON tk.MaND = sv.maSV
        LEFT JOIN Lop l ON sv.maLop = l.maLop
        LEFT JOIN Khoa k ON l.maKhoa = k.maKhoa
        WHERE tv.MaCLB = @MaCLB
          AND tv.TrangThai = N'Hoạt động'
        ORDER BY tv.NgayThamGia DESC
      `);

    res.status(200).json({
      success: true,
      data: result.recordset || [],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEstablishedClubs,
  getClubDetailForCTSV,
  getClubMembers,
};
