const { getPool } = require('../db/index');
const sql = require('mssql');

/**
 * GET /api/students/me
 * Lấy thông tin cá nhân của sinh viên
 */
async function getProfile(req, res, next) {
  try {
    const maND = req.user.maND;

    const pool = await getPool();
    const result = await pool.request()
      .input('maND', sql.VarChar, maND)
      .query(`
        SELECT 
          tk.MaND, tk.hoTen, tk.email, tk.soDienThoai, tk.ngaySinh, tk.gioiTinh, tk.anhDaiDien,
          sv.diemRenLuyen,
          l.tenLop, l.nienKhoa,
          k.tenKhoa
        FROM TAI_KHOAN tk
        LEFT JOIN SINHVIEN sv ON tk.MaND = sv.maSV
        LEFT JOIN Lop l ON sv.maLop = l.maLop
        LEFT JOIN Khoa k ON l.maKhoa = k.maKhoa
        WHERE tk.MaND = @maND
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin sinh viên' });
    }

    return res.status(200).json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/students/me
 * Cập nhật thông tin cá nhân cơ bản
 */
async function updateProfile(req, res, next) {
  try {
    const maND = req.user.maND;
    const { soDienThoai, ngaySinh, gioiTinh } = req.body;

    const pool = await getPool();
    await pool.request()
      .input('maND', sql.VarChar, maND)
      .input('soDienThoai', sql.VarChar, soDienThoai)
      .input('ngaySinh', sql.Date, ngaySinh)
      .input('gioiTinh', sql.NVarChar, gioiTinh)
      .query(`
        UPDATE TAI_KHOAN
        SET 
          soDienThoai = COALESCE(@soDienThoai, soDienThoai),
          ngaySinh = COALESCE(@ngaySinh, ngaySinh),
          gioiTinh = COALESCE(@gioiTinh, gioiTinh)
        WHERE MaND = @maND
      `);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
