const { getPool, sql } = require("../db");

// ─── Helper: Sinh MaSK tự động tăng dạng SK000000001 ───────────────────────
const generateMaSK = async (pool) => {
  const result = await pool.request().query(`
    SELECT TOP 1 MaSK FROM SU_KIEN
    WHERE MaSK LIKE 'SK%'
    ORDER BY MaSK DESC
  `);

  if (result.recordset.length === 0) {
    return "SK000000001";
  }

  const lastMaSK = result.recordset[0].MaSK; // e.g. "SK000000008"
  const lastNum = parseInt(lastMaSK.replace("SK", ""), 10); // 8
  const nextNum = lastNum + 1; // 9
  return `SK${String(nextNum).padStart(9, "0")}`; // "SK000000009"
};

// ─── Helper: Validate datetime string ──────────────────────────────────────
const parseDate = (value, fieldName) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new Error(`Giá trị ngày giờ không hợp lệ: ${fieldName} = "${value}"`);
  }
  return d;
};

// ─── Helper: Lấy MaCLB của người dùng (chủ nhiệm / phó chủ nhiệm) ──────────
const getClubOfUser = async (pool, maND) => {
  const clubResult = await pool.request().input("MaND", sql.NVarChar(50), maND)
    .query(`
      SELECT MaCLB
      FROM THANH_VIEN
      WHERE MaND = @MaND
        AND VaiTroCLB IN (N'Chủ nhiệm', N'Phó chủ nhiệm')
        AND TrangThai = N'Hoạt động'
    `);

  return clubResult.recordset.length > 0 ? clubResult.recordset[0].MaCLB : null;
};

/**
 * Lấy danh sách sự kiện của CLB (Ban chủ nhiệm)
 * GET /api/bcn/events?TrangThai=...
 */
const getEventsByClub = async (req, res, next) => {
  try {
    const { TrangThai } = req.query;
    const pool = await getPool();
    const maND = req.user.maND;

    const MaCLB = await getClubOfUser(pool, maND);
    if (!MaCLB) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Bạn không phải là chủ nhiệm hoặc phó chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    let query = `
      SELECT
        MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
        DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, TrangThai,
        UrlAnh, DiemRenLuyen, LyDoTuChoi, NgayTao
      FROM SU_KIEN
      WHERE MaCLB = @MaCLB
    `;
    const request = pool.request();
    request.input("MaCLB", sql.NVarChar(50), MaCLB);

    if (TrangThai) {
      query += ` AND TrangThai = @TrangThai`;
      request.input("TrangThai", sql.NVarChar(50), TrangThai);
    }

    query += ` ORDER BY NgayTao DESC`;

    const result = await request.query(query);

    res.status(200).json({
      success: true,
      data: result.recordset,
      total: result.recordset.length,
      MaCLB,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Lấy chi tiết sự kiện (Ban chủ nhiệm)
 * GET /api/bcn/events/:id
 */
const getEventDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const maND = req.user.maND;

    const MaCLB = await getClubOfUser(pool, maND);
    if (!MaCLB) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Bạn không phải là chủ nhiệm hoặc phó chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    const result = await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("MaCLB", sql.NVarChar(13), MaCLB).query(`
        SELECT
          MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
          DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, TrangThai,
          UrlAnh, DiemRenLuyen, LyDoTuChoi, NgayTao
        FROM SU_KIEN
        WHERE MaSK = @MaSK AND MaCLB = @MaCLB
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Sự kiện không tồn tại hoặc không thuộc câu lạc bộ của bạn",
        },
      });
    }

    const countResult = await pool.request().input("MaSK", sql.NVarChar(13), id)
      .query(`
        SELECT COUNT(*) AS soNguoiDaDangKy
        FROM DANGKY_SUKIEN
        WHERE MaSK = @MaSK AND TrangThai IN ('da_duyet', 'da_diem_danh')
      `);

    const event = result.recordset[0];
    event.soNguoiDaDangKy = countResult.recordset[0].soNguoiDaDangKy;

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

/**
 * Tạo sự kiện mới (Ban chủ nhiệm)
 * POST /api/bcn/events
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      TenSK,
      MoTa,
      ThoiGianBatDau,
      ThoiGianKetThuc,
      DiaDiem,
      SoNguoiToiDa,
      ChiPhiDuKien,
      LoaiSK,
      UrlAnh,
      DiemRenLuyen,
    } = req.body;

    // Validation bắt buộc
    if (!TenSK || !ThoiGianBatDau || !ThoiGianKetThuc) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Thiếu thông tin bắt buộc: TenSK, ThoiGianBatDau, ThoiGianKetThuc",
        },
      });
    }

    // Validate datetime trước khi dùng
    let dateBatDau, dateKetThuc;
    try {
      dateBatDau = parseDate(ThoiGianBatDau, "ThoiGianBatDau");
      dateKetThuc = parseDate(ThoiGianKetThuc, "ThoiGianKetThuc");
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: e.message },
      });
    }

    if (dateKetThuc <= dateBatDau) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "ThoiGianKetThuc phải sau ThoiGianBatDau",
        },
      });
    }

    const pool = await getPool();
    const maND = req.user.maND;

    const MaCLB = await getClubOfUser(pool, maND);
    if (!MaCLB) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Bạn không phải là chủ nhiệm hoặc phó chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    // Sinh MaSK tự động tăng, đảm bảo không vượt VARCHAR(13)
    const MaSK = await generateMaSK(pool);

    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), MaSK)
      .input("MaCLB", sql.NVarChar(13), MaCLB)
      .input("TenSK", sql.NVarChar(150), TenSK.trim())
      .input("MoTa", sql.NVarChar(sql.MAX), MoTa || null)
      .input("ThoiGianBatDau", sql.DateTime, dateBatDau)
      .input("ThoiGianKetThuc", sql.DateTime, dateKetThuc)
      .input("DiaDiem", sql.NVarChar(200), DiaDiem || null)
      .input(
        "SoNguoiToiDa",
        sql.Int,
        SoNguoiToiDa ? parseInt(SoNguoiToiDa) : null,
      )
      .input(
        "ChiPhiDuKien",
        sql.Decimal(18, 2),
        ChiPhiDuKien ? parseFloat(ChiPhiDuKien) : 0,
      )
      .input("LoaiSK", sql.NVarChar(50), LoaiSK || null)
      .input("TrangThai", sql.NVarChar(50), "draft")
      .input("UrlAnh", sql.NVarChar(255), UrlAnh || null)
      .input("DiemRenLuyen", sql.Int, DiemRenLuyen ? parseInt(DiemRenLuyen) : 5)
      .input("NgayTao", sql.DateTime, new Date()).query(`
        INSERT INTO SU_KIEN (
          MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
          DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, TrangThai,
          UrlAnh, DiemRenLuyen, NgayTao
        ) VALUES (
          @MaSK, @MaCLB, @TenSK, @MoTa, @ThoiGianBatDau, @ThoiGianKetThuc,
          @DiaDiem, @SoNguoiToiDa, @ChiPhiDuKien, @LoaiSK, @TrangThai,
          @UrlAnh, @DiemRenLuyen, @NgayTao
        )
      `);

    res.status(201).json({
      success: true,
      message: "Tạo sự kiện thành công",
      data: { MaSK, MaCLB },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cập nhật sự kiện (Ban chủ nhiệm)
 * PUT /api/bcn/events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      TenSK,
      MoTa,
      ThoiGianBatDau,
      ThoiGianKetThuc,
      DiaDiem,
      SoNguoiToiDa,
      ChiPhiDuKien,
      LoaiSK,
      UrlAnh,
      DiemRenLuyen,
    } = req.body;

    // Validation bắt buộc
    if (!TenSK || !ThoiGianBatDau || !ThoiGianKetThuc) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Thiếu thông tin bắt buộc: TenSK, ThoiGianBatDau, ThoiGianKetThuc",
        },
      });
    }

    // Validate datetime
    let dateBatDau, dateKetThuc;
    try {
      dateBatDau = parseDate(ThoiGianBatDau, "ThoiGianBatDau");
      dateKetThuc = parseDate(ThoiGianKetThuc, "ThoiGianKetThuc");
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: e.message },
      });
    }

    if (dateKetThuc <= dateBatDau) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "ThoiGianKetThuc phải sau ThoiGianBatDau",
        },
      });
    }

    const pool = await getPool();
    const maND = req.user.maND;

    const MaCLB = await getClubOfUser(pool, maND);
    if (!MaCLB) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Bạn không phải là chủ nhiệm hoặc phó chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("MaCLB", sql.NVarChar(13), MaCLB)
      .query(
        `SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK AND MaCLB = @MaCLB`,
      );

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Sự kiện không tồn tại hoặc không thuộc câu lạc bộ của bạn",
        },
      });
    }

    const currentStatus = checkResult.recordset[0].TrangThai;
    if (currentStatus !== "draft" && currentStatus !== "tu_choi") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Chỉ có thể sửa sự kiện ở trạng thái bản nháp hoặc bị từ chối",
        },
      });
    }

    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("TenSK", sql.NVarChar(150), TenSK.trim())
      .input("MoTa", sql.NVarChar(sql.MAX), MoTa || null)
      .input("ThoiGianBatDau", sql.DateTime, dateBatDau)
      .input("ThoiGianKetThuc", sql.DateTime, dateKetThuc)
      .input("DiaDiem", sql.NVarChar(200), DiaDiem || null)
      .input(
        "SoNguoiToiDa",
        sql.Int,
        SoNguoiToiDa ? parseInt(SoNguoiToiDa) : null,
      )
      .input(
        "ChiPhiDuKien",
        sql.Decimal(18, 2),
        ChiPhiDuKien ? parseFloat(ChiPhiDuKien) : 0,
      )
      .input("LoaiSK", sql.NVarChar(50), LoaiSK || null)
      .input("UrlAnh", sql.NVarChar(255), UrlAnh || null)
      .input("DiemRenLuyen", sql.Int, DiemRenLuyen ? parseInt(DiemRenLuyen) : 5)
      .query(`
        UPDATE SU_KIEN SET
          TenSK = @TenSK,
          MoTa = @MoTa,
          ThoiGianBatDau = @ThoiGianBatDau,
          ThoiGianKetThuc = @ThoiGianKetThuc,
          DiaDiem = @DiaDiem,
          SoNguoiToiDa = @SoNguoiToiDa,
          ChiPhiDuKien = @ChiPhiDuKien,
          LoaiSK = @LoaiSK,
          UrlAnh = @UrlAnh,
          DiemRenLuyen = @DiemRenLuyen
        WHERE MaSK = @MaSK
      `);

    res.status(200).json({
      success: true,
      message: "Cập nhật sự kiện thành công",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Xóa sự kiện (Ban chủ nhiệm)
 * DELETE /api/bcn/events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const maND = req.user.maND;

    const MaCLB = await getClubOfUser(pool, maND);
    if (!MaCLB) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Bạn không phải là chủ nhiệm hoặc phó chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("MaCLB", sql.NVarChar(13), MaCLB)
      .query(
        `SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK AND MaCLB = @MaCLB`,
      );

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Sự kiện không tồn tại hoặc không thuộc câu lạc bộ của bạn",
        },
      });
    }

    const currentStatus = checkResult.recordset[0].TrangThai;
    if (currentStatus !== "draft") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Chỉ có thể xóa sự kiện ở trạng thái bản nháp",
        },
      });
    }

    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .query(`DELETE FROM SU_KIEN WHERE MaSK = @MaSK`);

    res.status(200).json({
      success: true,
      message: "Xóa sự kiện thành công",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Gửi sự kiện để duyệt (Ban chủ nhiệm)
 * PATCH /api/bcn/events/:id/submit
 */
const submitEventForApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const maND = req.user.maND;

    // Kiểm tra sự kiện thuộc CLB của người dùng
    const MaCLB = await getClubOfUser(pool, maND);
    if (!MaCLB) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Bạn không có quyền thực hiện thao tác này",
        },
      });
    }

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .input("MaCLB", sql.NVarChar(13), MaCLB)
      .query(
        `SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK AND MaCLB = @MaCLB`,
      );

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Sự kiện không tồn tại" },
      });
    }

    const currentStatus = checkResult.recordset[0].TrangThai;
    if (currentStatus !== "draft" && currentStatus !== "tu_choi") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Sự kiện không ở trạng thái có thể gửi duyệt",
        },
      });
    }

    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .query(
        `UPDATE SU_KIEN SET TrangThai = 'cho_duyet_khoa' WHERE MaSK = @MaSK`,
      );

    res.status(200).json({
      success: true,
      message: "Gửi sự kiện để duyệt thành công",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Duyệt sự kiện (Cán bộ Khoa)
 * PATCH /api/bcn/events/:id/approve-faculty
 */
// const approveFaculty = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const pool = await getPool();

//     const checkResult = await pool
//       .request()
//       .input("MaSK", sql.NVarChar(13), id)
//       .query(`SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK`);

//     if (checkResult.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: { code: "NOT_FOUND", message: "Sự kiện không tồn tại" },
//       });
//     }

//     // Chỉ duyệt được khi đang ở trạng thái chờ duyệt khoa
//     const currentStatus = checkResult.recordset[0].TrangThai;
//     if (currentStatus !== "cho_duyet_khoa") {
//       return res.status(403).json({
//         success: false,
//         error: {
//           code: "FORBIDDEN",
//           message: "Sự kiện không ở trạng thái chờ duyệt khoa",
//         },
//       });
//     }

//     await pool
//       .request()
//       .input("MaSK", sql.NVarChar(13), id)
//       .query(
//         `UPDATE SU_KIEN SET TrangThai = 'cho_duyet_ctsv' WHERE MaSK = @MaSK`,
//       );

//     res.status(200).json({
//       success: true,
//       message: "Duyệt sự kiện từ Khoa thành công",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

/**
 * Duyệt sự kiện (Phòng CTSV)
 * PATCH /api/bcn/events/:id/approve-ctsv
 */
const approveCTSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .query(`SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK`);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Sự kiện không tồn tại" },
      });
    }

    // Chỉ duyệt được khi đang ở trạng thái chờ duyệt CTSV
    const currentStatus = checkResult.recordset[0].TrangThai;
    if (currentStatus !== "cho_duyet_ctsv") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Sự kiện không ở trạng thái chờ duyệt CTSV",
        },
      });
    }

    await pool
      .request()
      .input("MaSK", sql.NVarChar(13), id)
      .query(`UPDATE SU_KIEN SET TrangThai = 'da_duyet' WHERE MaSK = @MaSK`);

    res.status(200).json({
      success: true,
      message: "Duyệt sự kiện từ CTSV thành công",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Từ chối sự kiện
 * PATCH /api/bcn/events/:id/reject
 */
// const rejectEvent = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { LyDoTuChoi } = req.body;

//     if (!LyDoTuChoi || !LyDoTuChoi.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: "VALIDATION_ERROR",
//           message: "Vui lòng nhập lý do từ chối",
//         },
//       });
//     }

//     const pool = await getPool();

//     const checkResult = await pool
//       .request()
//       .input("MaSK", sql.NVarChar(13), id)
//       .query(`SELECT TrangThai FROM SU_KIEN WHERE MaSK = @MaSK`);

//     if (checkResult.recordset.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: { code: "NOT_FOUND", message: "Sự kiện không tồn tại" },
//       });
//     }

//     const currentStatus = checkResult.recordset[0].TrangThai;
//     if (
//       currentStatus !== "cho_duyet_khoa" &&
//       currentStatus !== "cho_duyet_ctsv"
//     ) {
//       return res.status(403).json({
//         success: false,
//         error: {
//           code: "FORBIDDEN",
//           message: "Chỉ có thể từ chối sự kiện đang chờ duyệt",
//         },
//       });
//     }

//     await pool
//       .request()
//       .input("MaSK", sql.NVarChar(13), id)
//       .input("LyDoTuChoi", sql.NVarChar(sql.MAX), LyDoTuChoi.trim()).query(`
//         UPDATE SU_KIEN
//         SET TrangThai = 'tu_choi', LyDoTuChoi = @LyDoTuChoi
//         WHERE MaSK = @MaSK
//       `);

//     res.status(200).json({
//       success: true,
//       message: "Từ chối sự kiện thành công",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

module.exports = {
  getEventsByClub,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEventForApproval,
  approveCTSV,
};
