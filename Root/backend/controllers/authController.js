const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db/index');
const sql = require('mssql');

/**
 * POST /api/auth/login
 * Đăng nhập bằng email và mật khẩu, trả về JWT token.
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

    // 6. Tạo JWT token
    const token = jwt.sign(
      {
        maSV: account.MaND,
        hoTen: account.hoTen,
        email: account.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 7. Cập nhật lanDangNhapCuoi
    await pool
      .request()
      .input('maND', sql.VarChar, account.MaND)
      .query('UPDATE TAI_KHOAN SET lanDangNhapCuoi = GETDATE() WHERE MaND = @maND');

    // 8. Trả về token và thông tin người dùng
    return res.status(200).json({
      success: true,
      data: {
        token,
        maSV: account.MaND,
        hoTen: account.hoTen,
        email: account.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
