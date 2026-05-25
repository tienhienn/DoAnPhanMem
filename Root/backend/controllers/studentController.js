const { getPool } = require('../db/index');
const sql = require('mssql');

/**
 * GET /api/students/me/events
 * Lấy danh sách sự kiện mà sinh viên đang đăng nhập đã đăng ký (trừ đã hủy).
 */
async function getMyEvents(req, res, next) {
  try {
    const maND = req.user.maSV;

    const pool = await getPool();
    const request = pool.request();
    request.input('maND', sql.Char, maND);

    const result = await request.query(`
      SELECT
        sk.MaSK                 AS maSK,
        sk.TenSK                AS tenSK,
        sk.ThoiGianBatDau       AS thoiGianBatDau,
        sk.ThoiGianKetThuc      AS thoiGianKetThuc,
        sk.DiaDiem              AS diaDiem,
        clb.TenCLB              AS tenCLB,
        sk.TrangThai            AS trangThaiSuKien,
        dk.TrangThai            AS trangThaiDangKy,
        sk.UrlAnh               AS urlAnh,
        sk.DiemRenLuyen         AS diemRenLuyen
      FROM DANGKY_SUKIEN dk
      INNER JOIN SU_KIEN sk ON dk.MaSK = sk.MaSK
      INNER JOIN CAULACBO clb ON sk.MaCLB = clb.MaCLB
      WHERE dk.MaND = @maND
        AND dk.TrangThai != 'da_huy'
      ORDER BY sk.ThoiGianBatDau DESC
    `);

    return res.status(200).json({
      success: true,
      data: result.recordset || [],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/students/me/notifications
 * Lấy danh sách thông báo của sinh viên
 */
async function getMyNotifications(req, res, next) {
  try {
    const maND = req.user.maND;

    const pool = await getPool();
    const result = await pool.request()
      .input('maND', sql.VarChar, maND)
      .query(`
        SELECT 
          tb.MaTB, tb.TieuDe, tb.NoiDung, tb.NgayGui, tb.LoaiTB,
          clb.TenCLB, clb.Logo as ClubLogo,
          ISNULL(tbnd.DaDoc, 0) as DaDoc
        FROM THONG_BAO_NGUOIDUNG tbnd
        JOIN THONG_BAO tb ON tbnd.MaTB = tb.MaTB
        LEFT JOIN CAULACBO clb ON tb.MaCLB = clb.MaCLB
        WHERE tbnd.MaND = @maND
        ORDER BY tb.NgayGui DESC
      `);

    return res.status(200).json({
      success: true,
      data: result.recordset || []
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/students/me/notifications/:id/read
 * Đánh dấu thông báo đã đọc
 */
async function markNotificationAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const maND = req.user.maND;

    const pool = await getPool();
    await pool.request()
      .input('maTB', sql.VarChar, id)
      .input('maND', sql.VarChar, maND)
      .query(`
        UPDATE THONG_BAO_NGUOIDUNG
        SET DaDoc = 1, NgayDoc = GETDATE()
        WHERE MaTB = @maTB AND MaND = @maND
      `);

    return res.status(200).json({
      success: true,
      message: 'Đánh dấu đã đọc thành công'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getMyEvents,
  getMyNotifications,
  markNotificationAsRead
};
