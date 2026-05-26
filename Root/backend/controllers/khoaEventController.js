const { getPool, sql } = require("../db");

// ─── Helper: Lấy maDVQL của Cán bộ Khoa ──────────────────────────────
const getDVQLOfCanBo = async (pool, maND) => {
  const result = await pool.request().input("MaND", sql.NVarChar(13), maND)
    .query(`
      SELECT maDVQL 
      FROM CANBO 
      WHERE maCanBo = @MaND AND trangThai = 1
    `);
  return result.recordset.length > 0 ? result.recordset[0].maDVQL : null;
};

/**
 * Lấy danh sách sự kiện cần duyệt/đã duyệt của Khoa
 * GET /api/khoa/events?TrangThai=...
 */
const getEventsForFaculty = async (req, res, next) => {
  try {
    const { TrangThai } = req.query;
    const pool = await getPool();
    const maND = req.user.maND || req.user.maSV;

    // 1. Lấy đơn vị quản lý của cán bộ
    const maDVQL = await getDVQLOfCanBo(pool, maND);
    if (!maDVQL) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Bạn không có quyền Cán bộ Khoa" },
      });
    }

    // 2. Query sự kiện thuộc các CLB do Khoa này quản lý
    let query = `
      SELECT 
        SK.*, CLB.TenCLB, CLB.maDVQL
      FROM SU_KIEN SK
      INNER JOIN CAULACBO CLB ON SK.MaCLB = CLB.MaCLB
      WHERE CLB.maDVQL = @MaDVQL
    `;
    const request = pool.request();
    request.input("MaDVQL", sql.NVarChar(13), maDVQL);

    // 3. Lọc theo trạng thái (nếu có)
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
 * Duyệt sự kiện (Cán bộ Khoa)
 * PATCH /api/khoa/events/:id/approve
 */
const approveEventByFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const maND = req.user.maND || req.user.maSV;

    const maDVQL = await getDVQLOfCanBo(pool, maND);
    if (!maDVQL) {
      return res
        .status(403)
        .json({ success: false, error: { message: "Bạn không có quyền." } });
    }

    // Kiểm tra quyền sở hữu của Khoa với sự kiện này
    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("MaDVQL", sql.NVarChar(13), maDVQL).query(`
        SELECT SK.TrangThai 
        FROM SU_KIEN SK
        INNER JOIN CAULACBO CLB ON SK.MaCLB = CLB.MaCLB
        WHERE SK.MaSK = @MaSK AND CLB.maDVQL = @MaDVQL
      `);

    if (checkResult.recordset.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          error: { message: "Sự kiện không thuộc Khoa quản lý." },
        });
    }

    if (checkResult.recordset[0].TrangThai !== "cho_duyet_khoa") {
      return res
        .status(400)
        .json({
          success: false,
          error: { message: "Sự kiện không ở trạng thái chờ duyệt Khoa." },
        });
    }

    // Đẩy trạng thái lên cho CTSV duyệt và đánh dấu Khoa đã duyệt
    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .query(
        `UPDATE SU_KIEN SET KhoaDuyet = 1, TrangThai = 'cho_duyet_ctsv', LyDoTuChoi = NULL WHERE MaSK = @MaSK`,
      );

    res
      .status(200)
      .json({ success: true, message: "Duyệt sự kiện thành công." });
  } catch (err) {
    next(err);
  }
};

/**
 * Từ chối sự kiện (Cán bộ Khoa)
 * PATCH /api/khoa/events/:id/reject
 */
const rejectEventByFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { LyDoTuChoi } = req.body;
    const pool = await getPool();
    const maND = req.user.maND || req.user.maSV;

    if (!LyDoTuChoi) {
      return res
        .status(400)
        .json({ success: false, error: { message: "Vui lòng nhập lý do." } });
    }

    const maDVQL = await getDVQLOfCanBo(pool, maND);
    if (!maDVQL) {
      return res
        .status(403)
        .json({ success: false, error: { message: "Bạn không có quyền." } });
    }

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("MaDVQL", sql.NVarChar(13), maDVQL).query(`
        SELECT SK.TrangThai 
        FROM SU_KIEN SK
        INNER JOIN CAULACBO CLB ON SK.MaCLB = CLB.MaCLB
        WHERE SK.MaSK = @MaSK AND CLB.maDVQL = @MaDVQL
      `);

    if (checkResult.recordset.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          error: { message: "Sự kiện không thuộc Khoa quản lý." },
        });
    }

    // Cập nhật trạng thái thành từ chối và lưu lý do
    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("LyDoTuChoi", sql.NVarChar(sql.MAX), LyDoTuChoi.trim())
      .query(
        `UPDATE SU_KIEN SET KhoaDuyet = 0, TrangThai = 'tu_choi', LyDoTuChoi = @LyDoTuChoi WHERE MaSK = @MaSK`,
      );

    res.status(200).json({ success: true, message: "Đã từ chối sự kiện." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEventsForFaculty,
  approveEventByFaculty,
  rejectEventByFaculty,
};
