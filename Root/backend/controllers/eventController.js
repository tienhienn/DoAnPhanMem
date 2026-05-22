const { getPool } = require('../db/index');
const sql = require('mssql');

/**
 * GET /api/events
 * Lấy danh sách sự kiện với các filter tùy chọn:
 *   - search   : tìm theo tên sự kiện hoặc tên CLB
 *   - clubId   : lọc theo mã CLB
 *   - availableOnly : chỉ lấy sự kiện còn chỗ (true/false)
 */
async function getEvents(req, res, next) {
  try {
    const { search, clubId, availableOnly } = req.query;

    // --- Base query ---
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
        sk.UrlAnh               AS urlAnh,
        sk.DiemRenLuyen         AS diemRenLuyen,
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

    // --- Dynamic filters ---
    if (search) {
      query += ` AND (sk.TenSK LIKE @search OR clb.TenCLB LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (clubId) {
      query += ` AND sk.MaCLB = @clubId`;
      request.input('clubId', sql.Char, clubId);
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
    const events = result.recordset || [];

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/events/:maSK
 * Chi tiết một sự kiện. Nếu đã đăng nhập (optionalAuth), trả thêm trangThaiDangKy.
 */
async function getEventById(req, res, next) {
  try {
    const { maSK } = req.params;

    const pool = await getPool();
    const request = pool.request();
    request.input('maSK', sql.Char, maSK);

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
        sk.UrlAnh               AS urlAnh,
        sk.DiemRenLuyen         AS diemRenLuyen,
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
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sự kiện không tồn tại',
        },
      });
    }

    const event = result.recordset[0];

    // Nếu đã đăng nhập, lấy thêm trạng thái đăng ký
    if (req.user) {
      const regRequest = pool.request();
      regRequest.input('maSK2', sql.Char, maSK);
      regRequest.input('maND', sql.Char, req.user.maSV);

      // Lấy bản ghi mới nhất: ưu tiên TrangThai khác 'da_huy', sau đó theo NgayDangKy DESC
      const regResult = await regRequest.query(`
        SELECT TOP 1 TrangThai
        FROM DANGKY_SUKIEN
        WHERE MaSK = @maSK2
          AND MaND = @maND
        ORDER BY
          CASE WHEN TrangThai != 'da_huy' THEN 0 ELSE 1 END ASC,
          NgayDangKy DESC
      `);

      event.trangThaiDangKy = regResult.recordset.length > 0
        ? regResult.recordset[0].TrangThai
        : null;
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/events/:maSK/register
 * Đăng ký tham gia sự kiện (yêu cầu đăng nhập).
 */
async function registerEvent(req, res, next) {
  try {
    const { maSK } = req.params;
    const maND = req.user.maSV;

    const pool = await getPool();

    // 1. Kiểm tra sự kiện tồn tại
    const skRequest = pool.request();
    skRequest.input('maSK', sql.Char, maSK);
    const skResult = await skRequest.query(`
      SELECT MaSK, TrangThai, SoNguoiToiDa
      FROM SU_KIEN
      WHERE MaSK = @maSK
    `);

    if (!skResult.recordset || skResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sự kiện không tồn tại',
        },
      });
    }

    const event = skResult.recordset[0];

    // 2. Kiểm tra trạng thái sự kiện
    if (event.TrangThai === 'da_ket_thuc' || event.TrangThai === 'da_huy') {
      return res.status(422).json({
        success: false,
        error: {
          code: 'UNPROCESSABLE',
          message: 'Không thể đăng ký sự kiện đã kết thúc hoặc bị hủy',
        },
      });
    }

    // 3. Kiểm tra còn chỗ
    const countRequest = pool.request();
    countRequest.input('maSK2', sql.Char, maSK);
    const countResult = await countRequest.query(`
      SELECT COUNT(*) AS soNguoiDaDangKy
      FROM DANGKY_SUKIEN
      WHERE MaSK = @maSK2
        AND TrangThai IN ('da_duyet', 'da_diem_danh')
    `);

    const soNguoiDaDangKy = countResult.recordset[0].soNguoiDaDangKy;
    if (soNguoiDaDangKy >= event.SoNguoiToiDa) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'UNPROCESSABLE',
          message: 'Sự kiện đã hết chỗ',
        },
      });
    }

    // 4. Kiểm tra đã đăng ký chưa
    const checkRequest = pool.request();
    checkRequest.input('maSK3', sql.Char, maSK);
    checkRequest.input('maND', sql.Char, maND);
    const checkResult = await checkRequest.query(`
      SELECT MaDK FROM DANGKY_SUKIEN
      WHERE MaSK = @maSK3
        AND MaND = @maND
        AND TrangThai != 'da_huy'
    `);

    if (checkResult.recordset && checkResult.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_REGISTERED',
          message: 'Bạn đã đăng ký sự kiện này',
        },
      });
    }

    // 5. Tạo MaDK mới (13 ký tự): DK + 9 số cuối timestamp + 2 số random
    const maDK = 'DK' + Date.now().toString().slice(-9) + Math.floor(Math.random() * 100).toString().padStart(2, '0');

    // 6. INSERT vào DANGKY_SUKIEN
    const insertRequest = pool.request();
    insertRequest.input('maDK', sql.Char, maDK);
    insertRequest.input('maSK4', sql.Char, maSK);
    insertRequest.input('maND2', sql.Char, maND);
    await insertRequest.query(`
      INSERT INTO DANGKY_SUKIEN (MaDK, MaSK, MaND, NgayDangKy, TrangThai)
      VALUES (@maDK, @maSK4, @maND2, GETDATE(), 'da_duyet')
    `);

    // 7. Lấy NgayDangKy vừa insert để trả về
    const fetchRequest = pool.request();
    fetchRequest.input('maDK2', sql.Char, maDK);
    const fetchResult = await fetchRequest.query(`
      SELECT NgayDangKy FROM DANGKY_SUKIEN WHERE MaDK = @maDK2
    `);

    const ngayDangKy = fetchResult.recordset[0]?.NgayDangKy || new Date();

    return res.status(201).json({
      success: true,
      data: {
        maDK,
        maSK,
        maSV: maND,
        ngayDangKy,
        trangThai: 'da_duyet',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/events/:maSK/register
 * Hủy đăng ký sự kiện (yêu cầu đăng nhập).
 */
async function cancelRegistration(req, res, next) {
  try {
    const { maSK } = req.params;
    const maND = req.user.maSV;

    const pool = await getPool();

    // 1. Kiểm tra sự kiện tồn tại
    const skRequest = pool.request();
    skRequest.input('maSK', sql.Char, maSK);
    const skResult = await skRequest.query(`
      SELECT MaSK FROM SU_KIEN WHERE MaSK = @maSK
    `);

    if (!skResult.recordset || skResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sự kiện không tồn tại',
        },
      });
    }

    // 2. Tìm đăng ký hợp lệ
    const regRequest = pool.request();
    regRequest.input('maSK2', sql.Char, maSK);
    regRequest.input('maND', sql.Char, maND);
    const regResult = await regRequest.query(`
      SELECT MaDK, TrangThai
      FROM DANGKY_SUKIEN
      WHERE MaSK = @maSK2
        AND MaND = @maND
        AND TrangThai IN ('da_duyet', 'cho_duyet', 'da_diem_danh')
    `);

    // 3. Không tìm thấy đăng ký
    if (!regResult.recordset || regResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy đăng ký hợp lệ để hủy',
        },
      });
    }

    const registration = regResult.recordset[0];

    // 4. Đã điểm danh thì không được hủy
    if (registration.TrangThai === 'da_diem_danh') {
      return res.status(422).json({
        success: false,
        error: {
          code: 'UNPROCESSABLE',
          message: 'Không thể hủy đăng ký sau khi đã điểm danh',
        },
      });
    }

    // 5. UPDATE TrangThai = 'da_huy'
    const updateRequest = pool.request();
    updateRequest.input('maDK', sql.Char, registration.MaDK);
    await updateRequest.query(`
      UPDATE DANGKY_SUKIEN SET TrangThai = 'da_huy' WHERE MaDK = @maDK
    `);

    // 6. Trả về thành công
    return res.status(200).json({
      success: true,
      data: {
        message: 'Hủy đăng ký thành công',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/events/:maSK/qr
 * Lấy QR code cho đăng ký sự kiện (yêu cầu đăng nhập và đã được duyệt).
 */
async function getEventQR(req, res, next) {
  try {
    const { maSK } = req.params;
    const maND = req.user.maSV;

    const pool = await getPool();

    // 1. Kiểm tra sự kiện tồn tại
    const skRequest = pool.request();
    skRequest.input('maSK', sql.Char, maSK);
    const skResult = await skRequest.query(`
      SELECT MaSK, TenSK, ThoiGianBatDau FROM SU_KIEN WHERE MaSK = @maSK
    `);

    if (!skResult.recordset || skResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Sự kiện không tồn tại',
        },
      });
    }

    const event = skResult.recordset[0];

    // 2. Kiểm tra đăng ký hợp lệ
    const regRequest = pool.request();
    regRequest.input('maSK2', sql.Char, maSK);
    regRequest.input('maND', sql.Char, maND);
    const regResult = await regRequest.query(`
      SELECT dk.MaDK, dk.TrangThai, tk.hoTen
      FROM DANGKY_SUKIEN dk
      INNER JOIN TAI_KHOAN tk ON dk.MaND = tk.MaND
      WHERE dk.MaSK = @maSK2
        AND dk.MaND = @maND
        AND dk.TrangThai IN ('da_duyet', 'da_diem_danh')
    `);

    // 3. Chưa đăng ký hoặc chưa được duyệt
    if (!regResult.recordset || regResult.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Bạn chưa đăng ký hoặc đăng ký chưa được duyệt',
        },
      });
    }

    const registration = regResult.recordset[0];

    // 4. Tạo qrValue
    const qrValue = `UTE-UDN-${req.user.maSV}-${maSK}`;

    // 5. Trả về
    return res.status(200).json({
      success: true,
      data: {
        qrValue,
        maSV: req.user.maSV,
        hoTen: req.user.hoTen,
        tenSK: event.TenSK,
        thoiGianBatDau: event.ThoiGianBatDau,
        trangThaiDangKy: registration.TrangThai,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEvents, getEventById, registerEvent, cancelRegistration, getEventQR };
