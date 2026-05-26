const { getPool, sql } = require("../db");

// 1. Lấy danh sách toàn bộ Báo cáo & Đơn giải thể (Trừ bản nháp)
const getAllSubmissions = async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        H.*, 
        C.TenCLB, 
        T.hoTen AS NguoiGui
      FROM HOSO H
      INNER JOIN CAULACBO C ON H.maCLB = C.MaCLB
      LEFT JOIN TAI_KHOAN T ON H.maNguoiGui = T.MaND
      WHERE H.TrangThai != 'draft'
      ORDER BY H.NgayGui DESC
    `);
    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// 2. Phê duyệt hồ sơ (Nếu là đơn giải thể -> Đổi trạng thái CLB)
const approveSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Kiểm tra hồ sơ
    const docRes = await pool
      .request()
      .input("MaHoSo", sql.VarChar(13), id)
      .query(
        `SELECT loaiHoSo, maCLB, TrangThai FROM HOSO WHERE MaHoSo = @MaHoSo`,
      );

    if (docRes.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: { message: "Không tìm thấy hồ sơ" } });
    }

    const doc = docRes.recordset[0];
    if (doc.TrangThai !== "submitted") {
      return res
        .status(400)
        .json({
          success: false,
          error: { message: "Hồ sơ không ở trạng thái chờ duyệt" },
        });
    }

    // Bắt đầu Transaction để đảm bảo tính toàn vẹn dữ liệu
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);

      // 1. Cập nhật trạng thái Hồ sơ
      await request
        .input("MaHoSo", sql.VarChar(13), id)
        .input("NguoiDuyet", sql.VarChar(13), req.user.maND).query(`
          UPDATE HOSO 
          SET TrangThai = 'approved', NgayDuyet = GETDATE(), maNguoiDuyet = @NguoiDuyet, LyDoTuChoi = NULL 
          WHERE MaHoSo = @MaHoSo
        `);

      // 2. Nếu là Đơn giải thể -> Tắt hoạt động CLB
      if (doc.loaiHoSo === "Đơn giải thể") {
        await request
          .input("MaCLB", sql.VarChar(13), doc.maCLB)
          .query(
            `UPDATE CAULACBO SET TrangThai = N'Ngừng hoạt động' WHERE MaCLB = @MaCLB`,
          );
      }

      await transaction.commit();
      res.status(200).json({ success: true, message: "Phê duyệt thành công!" });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

// 3. Từ chối hồ sơ
const rejectSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { LyDoTuChoi } = req.body;

    if (!LyDoTuChoi || !LyDoTuChoi.trim()) {
      return res
        .status(400)
        .json({
          success: false,
          error: { message: "Vui lòng cung cấp lý do từ chối" },
        });
    }

    const pool = await getPool();
    await pool
      .request()
      .input("MaHoSo", sql.VarChar(13), id)
      .input("NguoiDuyet", sql.VarChar(13), req.user.maND)
      .input("LyDo", sql.NVarChar(300), LyDoTuChoi).query(`
        UPDATE HOSO 
        SET TrangThai = 'tu_choi', NgayDuyet = GETDATE(), maNguoiDuyet = @NguoiDuyet, LyDoTuChoi = @LyDo 
        WHERE MaHoSo = @MaHoSo
      `);

    res.status(200).json({ success: true, message: "Đã từ chối hồ sơ!" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllSubmissions, approveSubmission, rejectSubmission };
