const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db/index');
const sql = require('mssql');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email và mật khẩu là bắt buộc' } });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT tk.MaND, tk.hoTen, tk.email, tk.matKhau, tk.trangThai, vt.tenVaiTro
        FROM TAI_KHOAN tk
        LEFT JOIN NGUOIDUNG_VAITRO ndvt ON tk.MaND = ndvt.MaND
        LEFT JOIN VAI_TRO vt ON ndvt.VaiTroID = vt.VaiTroID
        WHERE tk.email = @email
      `);

    const account = result.recordset[0];
    if (!account) {
      return res.status(401).json({ success: false, error: { message: 'Email hoặc mật khẩu không đúng' } });
    }

    const isPasswordValid = await bcrypt.compare(password, account.matKhau);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: { message: 'Email hoặc mật khẩu không đúng' } });
    }

    const token = jwt.sign(
      { maSV: account.MaND.trim(), hoTen: account.hoTen, email: account.email, role: account.tenVaiTro },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      data: { token, maSV: account.MaND.trim(), hoTen: account.hoTen, email: account.email, role: account.tenVaiTro },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
