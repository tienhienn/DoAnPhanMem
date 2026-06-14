const { getPool, sql } = require("../db");

/**
 * Lấy danh sách sự kiện cho CTSV (Tất cả CLB toàn trường)
 * GET /api/ctsv/events?TrangThai=...
 */
const getEventsForCTSV = async (req, res, next) => {
  try {
    const { TrangThai } = req.query;
    const pool = await getPool();

    // Query lấy sự kiện của TẤT CẢ các CLB
    let query = `
      SELECT 
        SK.*, CLB.TenCLB
      FROM SU_KIEN SK
      INNER JOIN CAULACBO CLB ON SK.MaCLB = CLB.MaCLB
      WHERE 1=1
    `;
    const request = pool.request();

    if (TrangThai) {
      query += ` AND SK.TrangThai = @TrangThai`;
      request.input("TrangThai", sql.NVarChar(50), TrangThai);
    }

    query += ` ORDER BY SK.NgayTao DESC`;

    const result = await request.query(query);

    res.status(200).json({
      success: true,
      data: result.recordset,
      total: result.recordset.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Duyệt sự kiện (Phòng CTSV)
 * PATCH /api/ctsv/events/:id/approve
 */
const approveEventByCTSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .query(`SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK`);

    if (checkResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: { message: "Sự kiện không tồn tại" } });
    }

    const currentStatus = checkResult.recordset[0].TrangThai;
    if (currentStatus !== "cho_duyet_ctsv") {
      return res
        .status(400)
        .json({
          success: false,
          error: { message: "Sự kiện không ở trạng thái chờ CTSV duyệt" },
        });
    }

    let FileCTSVXacNhan = null;
    if (req.file) {
      FileCTSVXacNhan = `/uploads/${req.file.filename}`;
    }

    // CTSV duyệt -> Chuyển thành Đã duyệt (Cấp phép) và đánh dấu PhongCTSVDuyet = 1
    await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .input("FileCTSVXacNhan", sql.NVarChar(255), FileCTSVXacNhan || null)
      .query(`UPDATE SU_KIEN SET PhongCTSVDuyet = 1, TrangThai = 'da_duyet', LyDoTuChoi = NULL, FileCTSVXacNhan = @FileCTSVXacNhan WHERE MaSK = @MaSK`);

    res
      .status(200)
      .json({ success: true, message: "Cấp phép sự kiện thành công." });
  } catch (err) {
    next(err);
  }
};

/**
 * Từ chối sự kiện (Phòng CTSV)
 * PATCH /api/ctsv/events/:id/reject
 */
const rejectEventByCTSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { LyDoTuChoi } = req.body;
    const pool = await getPool();

    if (!LyDoTuChoi) {
      return res
        .status(400)
        .json({
          success: false,
          error: { message: "Vui lòng nhập lý do từ chối." },
        });
    }

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .query(`SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK`);

    if (checkResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: { message: "Sự kiện không tồn tại." } });
    }

    await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .input("LyDoTuChoi", sql.NVarChar(sql.MAX), LyDoTuChoi.trim())
      .query(
        `UPDATE SU_KIEN SET PhongCTSVDuyet = 0, TrangThai = 'tu_choi', LyDoTuChoi = @LyDoTuChoi WHERE MaSK = @MaSK`,
      );

    res.status(200).json({ success: true, message: "Đã từ chối sự kiện." });
  } catch (err) {
    next(err);
  }
};

/**
 * Danh sách sự kiện đã được cấp phép (cho màn hình theo dõi CTSV)
 * GET /api/ctsv/events/approved
 */
const getApprovedEventsForCTSV = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        sk.MaSK,
        sk.TenSK,
        sk.MoTa,
        sk.ThoiGianBatDau,
        sk.ThoiGianKetThuc,
        sk.DiaDiem,
        sk.SoNguoiToiDa,
        sk.TrangThai,
        sk.UrlAnh,
        sk.DiemRenLuyen,
        sk.FileDinhKem,
        sk.FileCTSVXacNhan,
        clb.MaCLB,
        clb.TenCLB,
        (
          SELECT COUNT(*) FROM DANGKY_SUKIEN dk
          WHERE dk.MaSK = sk.MaSK
            AND dk.TrangThai IN ('da_duyet', 'da_diem_danh', 'cho_duyet')
        ) AS soNguoiDaDangKy
      FROM SU_KIEN sk
      INNER JOIN CAULACBO clb ON sk.MaCLB = clb.MaCLB
      WHERE sk.KhoaDuyet = 1
        AND sk.PhongCTSVDuyet = 1
      ORDER BY sk.ThoiGianBatDau DESC
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
 * Chi tiết sự kiện (CTSV — không lọc theo ngày kết thúc)
 * GET /api/ctsv/events/:id/detail
 */
const getEventDetailForCTSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .query(`
        SELECT
          sk.MaSK,
          sk.TenSK,
          sk.MoTa,
          sk.ThoiGianBatDau,
          sk.ThoiGianKetThuc,
          sk.DiaDiem,
          sk.SoNguoiToiDa,
          sk.TrangThai,
          sk.UrlAnh,
          sk.DiemRenLuyen,
          sk.FileDinhKem,
          sk.FileCTSVXacNhan,
          clb.MaCLB,
          clb.TenCLB,
          (
            SELECT COUNT(*) FROM DANGKY_SUKIEN dk
            WHERE dk.MaSK = sk.MaSK
              AND dk.TrangThai IN ('da_duyet', 'da_diem_danh', 'cho_duyet')
          ) AS soNguoiDaDangKy
        FROM SU_KIEN sk
        INNER JOIN CAULACBO clb ON sk.MaCLB = clb.MaCLB
        WHERE sk.MaSK = @MaSK
          AND sk.KhoaDuyet = 1
          AND sk.PhongCTSVDuyet = 1
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        success: false,
        error: { message: "Sự kiện không tồn tại hoặc chưa được cấp phép" },
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Danh sách sinh viên đăng ký sự kiện
 * GET /api/ctsv/events/:id/participants
 */
const getEventParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .query(`
        SELECT
          RTRIM(tk.MaND)          AS maSV,
          tk.hoTen,
          tk.email,
          tk.soDienThoai,
          l.tenLop,
          k.tenKhoa,
          dk.NgayDangKy,
          dk.TrangThai
        FROM DANGKY_SUKIEN dk
        INNER JOIN TAI_KHOAN tk ON dk.MaND = tk.MaND
        LEFT JOIN SINHVIEN sv ON tk.MaND = sv.maSV
        LEFT JOIN Lop l ON sv.maLop = l.maLop
        LEFT JOIN Khoa k ON l.maKhoa = k.maKhoa
        WHERE dk.MaSK = @MaSK
          AND dk.TrangThai != 'da_huy'
        ORDER BY dk.NgayDangKy DESC
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
  getEventsForCTSV,
  getApprovedEventsForCTSV,
  getEventDetailForCTSV,
  getEventParticipants,
  approveEventByCTSV,
  rejectEventByCTSV,
};
