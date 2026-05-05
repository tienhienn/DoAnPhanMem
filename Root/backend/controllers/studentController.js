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
        dk.TrangThai            AS trangThaiDangKy
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

module.exports = { getMyEvents };
