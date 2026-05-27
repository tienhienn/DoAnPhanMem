const { getPool, sql } = require("../db");

// Helper: Lấy MaCLB của tài khoản BCN hiện tại
const getClubOfUser = async (pool, maND) => {
  const result = await pool.request().input("MaND", sql.VarChar, maND)
    .query(`
      SELECT MaCLB FROM THANH_VIEN 
      WHERE MaND = @MaND AND VaiTroCLB IN (N'Chủ nhiệm', N'Phó chủ nhiệm', N'Trưởng ban') AND TrangThai = N'Hoạt động'
    `);
  return result.recordset.length > 0 ? result.recordset[0].MaCLB : null;
};

// Helper: Tự động tăng mã Tài Chính (TC000000001)
const generateMaTC = async (pool) => {
  const result = await pool
    .request()
    .query(`SELECT TOP 1 MaTC FROM TAI_CHINH ORDER BY MaTC DESC`);
  if (result.recordset.length === 0) return "TC000000001";
  const lastNum = parseInt(result.recordset[0].MaTC.replace("TC", ""), 10);
  return `TC${String(lastNum + 1).padStart(9, "0")}`;
};

// Helper: Tự động tăng mã Phiếu Mượn (PM000000001)
const generateMaPhieu = async (pool) => {
  const result = await pool
    .request()
    .query(`SELECT TOP 1 MaPhieu FROM PHIEU_MUON_TRA ORDER BY MaPhieu DESC`);
  if (result.recordset.length === 0) return "PM000000001";
  const lastNum = parseInt(result.recordset[0].MaPhieu.replace("PM", ""), 10);
  return `PM${String(lastNum + 1).padStart(9, "0")}`;
};

// 1. Lấy dữ liệu mồi (Sự kiện của CLB & Danh sách Thiết bị của nhà trường)
const getResources = async (req, res, next) => {
  try {
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);

    const eventsRes = await pool
      .request()
      .input("MaCLB", sql.VarChar, MaCLB)
      .query(
        "SELECT MaSK, TenSK FROM SU_KIEN WHERE MaCLB = @MaCLB ORDER BY NgayTao DESC",
      );

    const assetsRes = await pool
      .request()
      .query("SELECT MaTS, TenTS, SoLuongTong FROM TAI_SAN");

    res
      .status(200)
      .json({
        success: true,
        events: eventsRes.recordset,
        assets: assetsRes.recordset,
      });
  } catch (err) {
    next(err);
  }
};

// 2. Lấy danh sách lịch sử tài chính từ bảng TAI_CHINH
const getTransactions = async (req, res, next) => {
  try {
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);

    const result = await pool.request().input("MaCLB", sql.VarChar, MaCLB)
      .query(`
      SELECT MaTC, TenTaiChinh, Nam, TongThu, TongChi, NgayBatDau, TrangThai, NgayTao
      FROM TAI_CHINH
      WHERE MaCLB = @MaCLB
      ORDER BY NgayTao DESC
    `);
    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// 3. Tạo một khoản thu/chi mới (Insert vào bảng TAI_CHINH)
const createTransaction = async (req, res, next) => {
  try {
    const { content, type, amount, date } = req.body; // type: 'Thu' hoặc 'Chi'
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);
    const MaTC = await generateMaTC(pool);
    const year = new Date(date).getFullYear();

    const tongThu = type === "Thu" ? amount : 0;
    const tongChi = type === "Chi" ? amount : 0;

    await pool
      .request()
      .input("MaTC", sql.VarChar, MaTC)
      .input("MaCLB", sql.VarChar, MaCLB)
      .input("TenTaiChinh", sql.NVarChar(100), content)
      .input("Nam", sql.Int, year)
      .input("TongThu", sql.Decimal(18, 2), tongThu)
      .input("TongChi", sql.Decimal(18, 2), tongChi)
      .input("NgayBatDau", sql.Date, new Date(date)).query(`
        INSERT INTO TAI_CHINH (MaTC, MaCLB, TenTaiChinh, Nam, TongThu, TongChi, NgayBatDau, TrangThai, NgayTao)
        VALUES (@MaTC, @MaCLB, @TenTaiChinh, @Nam, @TongThu, @TongChi, @NgayBatDau, N'Hoạt động', GETDATE())
      `);
    res.status(201).json({ success: true, message: "Thành công" });
  } catch (err) {
    next(err);
  }
};

// 4. Lấy danh sách phiếu mượn tài sản
const getBorrowings = async (req, res, next) => {
  try {
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);

    const result = await pool.request().input("MaCLB", sql.VarChar, MaCLB)
      .query(`
      SELECT 
        PM.MaPhieu, PM.NgayTaoPhieu, PM.NgayTraDuKien, PM.trangThaiPhieu,
        SK.TenSK, TS.TenTS, CT.SoLuongMuon, TK.hoTen as NguoiMuon
      FROM PHIEU_MUON_TRA PM
      LEFT JOIN CHI_TIET_PHIEU_MUON CT ON PM.MaPhieu = CT.MaPhieu
      LEFT JOIN TAI_SAN TS ON CT.MaTS = TS.MaTS
      LEFT JOIN SU_KIEN SK ON PM.MaSK = SK.MaSK
      LEFT JOIN TAI_KHOAN TK ON PM.NguoiMuonID = TK.MaND
      WHERE PM.MaCLB = @MaCLB
      ORDER BY PM.NgayTaoPhieu DESC
    `);
    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// 5. Lập phiếu mượn mới (Transaction đồng thời vào PHIEU_MUON_TRA và CHI_TIET_PHIEU_MUON)
const createBorrowing = async (req, res, next) => {
  try {
    const { assetId, eventId, borrowDate, returnDate, quantity } = req.body;
    const pool = await getPool();
    const MaCLB = await getClubOfUser(pool, req.user.maND);
    const MaPhieu = await generateMaPhieu(pool);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);

      await request
        .input("MaPhieu", sql.VarChar, MaPhieu)
        .input("MaCLB", sql.VarChar, MaCLB)
        .input("MaSK", sql.VarChar, eventId || null)
        .input("NguoiMuon", sql.VarChar, req.user.maND)
        .input("NgayTao", sql.Date, new Date(borrowDate))
        .input("NgayTra", sql.Date, new Date(returnDate)).query(`
          INSERT INTO PHIEU_MUON_TRA (MaPhieu, MaCLB, MaSK, NguoiMuonID, NgayTaoPhieu, NgayTraDuKien, trangThaiPhieu)
          VALUES (@MaPhieu, @MaCLB, @MaSK, @NguoiMuon, @NgayTao, @NgayTra, N'Đang mượn')
        `);

      await request
        .input("MaTS", sql.VarChar, assetId)
        .input("SoLuong", sql.Int, quantity || 1).query(`
          INSERT INTO CHI_TIET_PHIEU_MUON (MaPhieu, MaTS, SoLuongMuon, tinhTrang)
          VALUES (@MaPhieu, @MaTS, @SoLuong, N'Tốt')
        `);

      await transaction.commit();
      res
        .status(201)
        .json({ success: true, message: "Lập phiếu mượn thành công" });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

// 6. Hoàn trả thiết bị
const returnEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    await pool.request().input("MaPhieu", sql.VarChar, id).query(`
      UPDATE PHIEU_MUON_TRA SET trangThaiPhieu = N'Đã trả' WHERE MaPhieu = @MaPhieu
    `);
    res
      .status(200)
      .json({ success: true, message: "Đã trả thiết bị thành công" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getResources,
  getTransactions,
  createTransaction,
  getBorrowings,
  createBorrowing,
  returnEquipment,
};
