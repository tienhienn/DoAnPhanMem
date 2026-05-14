const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db/index');
const sql = require('mssql');

/**
 * Map VaiTroID từ DB sang role string dùng trong hệ thống.
 *
 * VT000000001 → 'SV'   (Sinh viên)
 * VT000000002 → 'BCN'  (Ban chủ nhiệm CLB)
 * VT000000003 → 'KHOA' (Cán bộ khoa/đoàn)
 * VT000000004 → 'CTSV' (Phòng Công tác Sinh viên)
 *
 * @param {string} vaiTroID
 * @returns {string}
 */
function mapVaiTroToRole(vaiTroID) {
  const map = {
    VT000000001: 'SV',
    VT000000002: 'BCN',
    VT000000003: 'KHOA',
    VT000000004: 'CTSV',
  };
  return map[vaiTroID] || 'SV';
}

/**
 * POST /api/auth/login
 * Đăng nhập bằng email và mật khẩu, trả về JWT token kèm role.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email và mật khẩu là bắt buộc',
        },
      });
    }

    // 2. Query TAI_KHOAN theo email
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query(
        'SELECT MaND, hoTen, email, matKhau, trangThai FROM TAI_KHOAN WHERE email = @email'
      );

    const account = result.recordset[0];

    // 3. Không tìm thấy tài khoản
    if (!account) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email hoặc mật khẩu không đúng',
        },
      });
    }

    // 4. Tài khoản bị vô hiệu hóa (trangThai = 0)
    if (account.trangThai === false || account.trangThai === 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Tài khoản đã bị vô hiệu hóa',
        },
      });
    }

    // 5. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, account.matKhau);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email hoặc mật khẩu không đúng',
        },
      });
    }

    // 6. Lấy vai trò từ NGUOIDUNG_VAITRO (lấy vai trò cao nhất nếu có nhiều)
    const roleResult = await pool
      .request()
      .input('maND', sql.VarChar, account.MaND)
      .query(
        `SELECT TOP 1 nv.VaiTroID
         FROM NGUOIDUNG_VAITRO nv
         INNER JOIN VAI_TRO vt ON nv.VaiTroID = vt.VaiTroID
         WHERE nv.MaND = @maND AND vt.trangThai = 1
         ORDER BY nv.VaiTroID DESC`
      );

    const vaiTroID = roleResult.recordset[0]?.VaiTroID || 'VT000000001';
    const role = mapVaiTroToRole(vaiTroID);

    // 7. Tạo JWT token kèm role
    const token = jwt.sign(
      {
        maND: account.MaND,
        // Giữ maSV để tương thích ngược với code cũ
        maSV: account.MaND,
        hoTen: account.hoTen,
        email: account.email,
        role,
        vaiTroID,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 8. Cập nhật lanDangNhapCuoi
    await pool
      .request()
      .input('maND', sql.VarChar, account.MaND)
      .query('UPDATE TAI_KHOAN SET lanDangNhapCuoi = GETDATE() WHERE MaND = @maND');

    // 9. Trả về token và thông tin người dùng
    return res.status(200).json({
      success: true,
      data: {
        token,
        maND: account.MaND,
        maSV: account.MaND,
        hoTen: account.hoTen,
        email: account.email,
        role,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
