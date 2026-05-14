const { getPool } = require('../db/index');
const sql = require('mssql');

/**
 * GET /api/events
 */
async function getEvents(req, res, next) {
  try {
    const { search, clubId, availableOnly } = req.query;
    let query = `
      SELECT
        sk.MaSK                 AS maSK,
        sk.TenSK                AS tenSK,
        sk.MoTa                 AS moTa,
        sk.ThoiGianBatDau       AS thoiGianBatDau,
        sk.ThoiGianKetThuc      AS thoiGianKetThuc,
        sk.DiaDiem              AS diaDiem,
        sk.SoNguoiToiDa         AS soNguoiToiDa,
        sk.LoaiSK               AS loaiSK,
        sk.TrangThai            AS trangThai,
        clb.MaCLB               AS maCLB,
        clb.TenCLB              AS tenCLB,
        (
          SELECT COUNT(*) FROM DANGKY_SUKIEN dk
          WHERE dk.MaSK = sk.MaSK
            AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
        ) AS soNguoiDaDangKy
      FROM SU_KIEN sk
      INNER JOIN CAULACBO clb ON sk.MaCLB = clb.MaCLB
      WHERE 1=1
    `;

    const pool = await getPool();
    const request = pool.request();

    if (search) {
      query += ` AND (sk.TenSK LIKE @search OR clb.TenCLB LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }
    if (clubId) {
      query += ` AND sk.MaCLB = @clubId`;
      request.input('clubId', sql.VarChar, clubId);
    }
    if (availableOnly === 'true') {
      query += `
        AND sk.TrangThai IN ('sap_dien_ra', 'dang_dien_ra')
        AND (
          SELECT COUNT(*) FROM DANGKY_SUKIEN dk
          WHERE dk.MaSK = sk.MaSK
            AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
        ) < sk.SoNguoiToiDa
      `;
    }

    const result = await request.query(query);
    return res.status(200).json({ success: true, data: result.recordset || [] });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/events/:maSK
 */
async function getEventById(req, res, next) {
  try {
    const { maSK } = req.params;
    const pool = await getPool();
    const request = pool.request();
    request.input('maSK', sql.VarChar, maSK);

    const result = await request.query(`
      SELECT
        sk.MaSK                 AS maSK,
        sk.TenSK                AS tenSK,
        sk.MoTa                 AS moTa,
        sk.ThoiGianBatDau       AS thoiGianBatDau,
        sk.ThoiGianKetThuc      AS thoiGianKetThuc,
        sk.DiaDiem              AS diaDiem,
        sk.SoNguoiToiDa         AS soNguoiToiDa,
        sk.LoaiSK               AS loaiSK,
        sk.TrangThai            AS trangThai,
        clb.MaCLB               AS maCLB,
        clb.TenCLB              AS tenCLB,
        (
          SELECT COUNT(*) FROM DANGKY_SUKIEN dk
          WHERE dk.MaSK = sk.MaSK
            AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
        ) AS soNguoiDaDangKy
      FROM SU_KIEN sk
      INNER JOIN CAULACBO clb ON sk.MaCLB = clb.MaCLB
      WHERE sk.MaSK = @maSK
    `);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Sự kiện không tồn tại' } });
    }

    const event = result.recordset[0];
    if (req.user) {
      const regRequest = pool.request();
      regRequest.input('maSK2', sql.VarChar, maSK);
      regRequest.input('maND', sql.VarChar, req.user.maSV);
      const regResult = await regRequest.query(`
        SELECT TOP 1 TrangThai FROM DANGKY_SUKIEN
        WHERE MaSK = @maSK2 AND MaND = @maND
        ORDER BY CASE WHEN TrangThai != 'da_huy' THEN 0 ELSE 1 END ASC, NgayDangKy DESC
      `);
      event.trangThaiDangKy = regResult.recordset.length > 0 ? regResult.recordset[0].TrangThai : null;
    }

    return res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/events/:maSK/participants
 */
async function getParticipants(req, res, next) {
  try {
    const { maSK } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('maSK', sql.VarChar, maSK)
      .query(`
        SELECT tk.MaND AS maSV, tk.hoTen, tk.email, tk.soDienThoai, 
               dk.NgayDangKy, dk.TrangThai
        FROM DANGKY_SUKIEN dk
        JOIN TAI_KHOAN tk ON dk.MaND = tk.MaND
        WHERE dk.MaSK = @maSK
      `);
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/events/:maSK/register
 */
async function registerEvent(req, res, next) {
  try {
    const { maSK } = req.params;
    const maND = req.user.maSV;
    const pool = await getPool();

    const skResult = await pool.request().input('maSK', sql.VarChar, maSK)
      .query('SELECT MaSK, TrangThai, SoNguoiToiDa FROM SU_KIEN WHERE MaSK = @maSK');

    if (!skResult.recordset.length) return res.status(404).json({ success: false, error: { message: 'Sự kiện không tồn tại' } });
    const event = skResult.recordset[0];

    if (event.TrangThai === 'da_ket_thuc') return res.status(422).json({ success: false, error: { message: 'Sự kiện đã kết thúc' } });

    const countResult = await pool.request().input('maSK', sql.VarChar, maSK)
      .query("SELECT COUNT(*) AS total FROM DANGKY_SUKIEN WHERE MaSK = @maSK AND TrangThai IN ('da_duyet', 'da_diem_danh')");
    
    if (countResult.recordset[0].total >= event.SoNguoiToiDa) return res.status(422).json({ success: false, error: { message: 'Hết chỗ' } });

    const maDK = 'DK' + Date.now().toString().slice(-9);
    await pool.request()
      .input('maDK', sql.VarChar, maDK).input('maSK', sql.VarChar, maSK).input('maND', sql.VarChar, maND)
      .query("INSERT INTO DANGKY_SUKIEN (MaDK, MaSK, MaND, NgayDangKy, TrangThai) VALUES (@maDK, @maSK, @maND, GETDATE(), 'da_duyet')");

    return res.status(201).json({ success: true, data: { maDK, maSK, maSV: maND, trangThai: 'da_duyet' } });
  } catch (err) {
    next(err);
  }
}

async function cancelRegistration(req, res, next) {
  try {
    const { maSK } = req.params;
    const maND = req.user.maSV;
    const pool = await getPool();
    await pool.request().input('maSK', sql.VarChar, maSK).input('maND', sql.VarChar, maND)
      .query("UPDATE DANGKY_SUKIEN SET TrangThai = 'da_huy' WHERE MaSK = @maSK AND MaND = @maND AND TrangThai != 'da_diem_danh'");
    return res.status(200).json({ success: true, data: { message: 'Hủy đăng ký thành công' } });
  } catch (err) {
    next(err);
  }
}

async function getEventQR(req, res, next) {
  try {
    const { maSK } = req.params;
    const maND = req.user.maSV;
    const pool = await getPool();
    const result = await pool.request().input('maSK', sql.VarChar, maSK).input('maND', sql.VarChar, maND)
      .query("SELECT MaDK FROM DANGKY_SUKIEN WHERE MaSK = @maSK AND MaND = @maND AND TrangThai IN ('da_duyet', 'da_diem_danh')");
    if (!result.recordset.length) return res.status(403).json({ success: false, error: { message: 'Chưa đăng ký' } });
    return res.status(200).json({ success: true, data: { qrValue: `HCMUTE-${maND}-${maSK}` } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEvents, getEventById, registerEvent, cancelRegistration, getEventQR, getParticipants };
