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
      .input("MaSK", sql.NVarChar(13), id)
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

    // CTSV duyệt -> Chuyển thành Đã duyệt (Cấp phép) và đánh dấu PhongCTSVDuyet = 1
    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .query(`UPDATE SU_KIEN SET PhongCTSVDuyet = 1, TrangThai = 'da_duyet', LyDoTuChoi = NULL WHERE MaSK = @MaSK`);

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
      .input("MaSK", sql.NVarChar(13), id)
      .query(`SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK`);

    if (checkResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: { message: "Sự kiện không tồn tại." } });
    }

    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("LyDoTuChoi", sql.NVarChar(sql.MAX), LyDoTuChoi.trim())
      .query(
        `UPDATE SU_KIEN SET PhongCTSVDuyet = 0, TrangThai = 'tu_choi', LyDoTuChoi = @LyDoTuChoi WHERE MaSK = @MaSK`,
      );

    res.status(200).json({ success: true, message: "Đã từ chối sự kiện." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEventsForCTSV,
  approveEventByCTSV,
  rejectEventByCTSV,
};
