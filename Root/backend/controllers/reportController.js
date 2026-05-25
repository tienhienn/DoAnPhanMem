const { getPool, sql } = require("../db");

// Helper: Sinh mã Hồ sơ (HS000000001)
const generateMaHS = async (pool) => {
  const result = await pool
    .request()
    .query(
      `SELECT TOP 1 MaHoSo FROM HOSO WHERE MaHoSo LIKE 'HS%' ORDER BY MaHoSo DESC`,
    );
  if (result.recordset.length === 0) return "HS000000001";
  const lastNum = parseInt(result.recordset[0].MaHoSo.replace("HS", ""), 10);
  return `HS${String(lastNum + 1).padStart(9, "0")}`;
};

// 1. Lấy danh sách hồ sơ của CLB
const getReportsByClub = async (req, res, next) => {
  try {
    const pool = await getPool();
    // Lấy MaCLB từ user BCN
    const clubRes = await pool
      .request()
      .input("MaND", sql.VarChar, req.user.maND)
      .query(
        `SELECT MaCLB FROM THANH_VIEN WHERE MaND = @MaND AND VaiTroCLB IN (N'Chủ nhiệm', N'Phó chủ nhiệm')`,
      );
    const MaCLB = clubRes.recordset[0]?.MaCLB;

    const result = await pool
      .request()
      .input("MaCLB", sql.VarChar, MaCLB)
      .query(`SELECT * FROM HOSO WHERE maCLB = @MaCLB ORDER BY NgayGui DESC`);

    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// 2. Tạo báo cáo hoặc Đơn giải thể
const createReport = async (req, res, next) => {
  try {
    const { title, summary, type, status } = req.body; // type: 'Báo cáo', 'Đơn giải thể'
    const pool = await getPool();

    const clubRes = await pool
      .request()
      .input("MaND", sql.VarChar, req.user.maND)
      .query(
        `SELECT MaCLB FROM THANH_VIEN WHERE MaND = @MaND AND VaiTroCLB IN (N'Chủ nhiệm', N'Phó chủ nhiệm')`,
      );
    const MaCLB = clubRes.recordset[0]?.MaCLB;

    const MaHS = await generateMaHS(pool);
    const fileName = req.file ? `/uploads/${req.file.filename}` : null;

    await pool
      .request()
      .input("MaHS", sql.VarChar, MaHS)
      .input("MaCLB", sql.VarChar, MaCLB)
      .input("MaND", sql.VarChar, req.user.maND)
      .input("Loai", sql.NVarChar, type)
      .input("TieuDe", sql.NVarChar, title)
      .input("NoiDung", sql.NVarChar, summary)
      .input("File", sql.NVarChar, fileName)
      .input("Status", sql.NVarChar, status).query(`
        INSERT INTO HOSO (MaHoSo, maCLB, maNguoiGui, loaiHoSo, TieuDe, NoiDung, FileDinhKem, TrangThai, NgayGui)
        VALUES (@MaHS, @MaCLB, @MaND, @Loai, @TieuDe, @NoiDung, @File, @Status, GETDATE())
      `);

    res.status(201).json({ success: true, message: "Đã gửi hồ sơ thành công" });
  } catch (err) {
    next(err);
  }
};

// 3. Xóa hồ sơ (Chỉ xóa được bản nháp)
const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const check = await pool
      .request()
      .input("id", sql.VarChar, id)
      .query(`SELECT TrangThai FROM HOSO WHERE MaHoSo = @id`);

    if (check.recordset[0].TrangThai !== "draft") {
      return res
        .status(400)
        .json({ success: false, message: "Chỉ có thể xóa bản nháp" });
    }

    await pool
      .request()
      .input("id", sql.VarChar, id)
      .query(`DELETE FROM HOSO WHERE MaHoSo = @id`);
    res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReportsByClub, createReport, deleteReport };
