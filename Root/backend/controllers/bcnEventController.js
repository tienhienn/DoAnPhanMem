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

// ─── Helper: Lấy MaCLB của người dùng (chủ nhiệm) ──────────
const getClubOfUser = async (pool, maND) => {
  const clubResult = await pool.request().input("MaND", sql.NVarChar(50), maND)
    .query(`
      SELECT MaCLB
      FROM THANH_VIEN
      WHERE MaND = @MaND
        AND VaiTroCLB IN (N'Chủ nhiệm')
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
            "Bạn không phải là chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    let query = `
      SELECT
        MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
        DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, TrangThai,
        UrlAnh, DiemRenLuyen, LyDoTuChoi, NgayTao,
        KhoaDuyet, PhongCTSVDuyet
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
            "Bạn không phải là chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    const result = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .input("MaCLB", sql.NVarChar, MaCLB).query(`
        SELECT
          MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
          DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, TrangThai,
          UrlAnh, DiemRenLuyen, LyDoTuChoi, NgayTao,
          KhoaDuyet, PhongCTSVDuyet
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

    const countResult = await pool.request().input("MaSK", sql.NVarChar, id)
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
    console.log("[DEBUG] createEvent req.body:", JSON.stringify(req.body, null, 2));
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
            "Bạn không phải là chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    // Sinh MaSK tự động tăng, đảm bảo không vượt VARCHAR(13)
    const MaSK = await generateMaSK(pool);

    await pool
      .request()
      .input("MaSK", sql.NVarChar, MaSK)
      .input("MaCLB", sql.NVarChar, MaCLB)
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
      .input("UrlAnh", sql.NVarChar(sql.MAX), UrlAnh || null)
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
            "Bạn không phải là chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .input("MaCLB", sql.NVarChar, MaCLB)
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
      .input("MaSK", sql.NVarChar, id)
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
      .input("UrlAnh", sql.NVarChar(sql.MAX), UrlAnh || null)
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
            "Bạn không phải là chủ nhiệm của bất kỳ câu lạc bộ nào",
        },
      });
    }

    const checkResult = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .input("MaCLB", sql.NVarChar, MaCLB)
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
      .input("MaSK", sql.NVarChar, id)
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
      .input("MaSK", sql.NVarChar, id)
      .input("MaCLB", sql.NVarChar, MaCLB)
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
      .input("MaSK", sql.NVarChar, id)
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
// const approveCTSV = async (req, res, next) => {
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

//     // Chỉ duyệt được khi đang ở trạng thái chờ duyệt CTSV
//     const currentStatus = checkResult.recordset[0].TrangThai;
//     if (currentStatus !== "cho_duyet_ctsv") {
//       return res.status(403).json({
//         success: false,
//         error: {
//           code: "FORBIDDEN",
//           message: "Sự kiện không ở trạng thái chờ duyệt CTSV",
//         },
//       });
//     }

//     await pool
//       .request()
//       .input("MaSK", sql.NVarChar(13), id)
//       .query(`UPDATE SU_KIEN SET TrangThai = 'da_duyet' WHERE MaSK = @MaSK`);

//     res.status(200).json({
//       success: true,
//       message: "Duyệt sự kiện từ CTSV thành công",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

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
//
//     res.status(200).json({
//       success: true,
//       message: "Từ chối sự kiện thành công",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const markAttendance = async (req, res, next) => {
  try {
    const { qrValue, maND: bodyMaND, maSK: bodyMaSK } = req.body;
    const pool = await getPool();
    const maND_bcn = req.user.maND;

    // 1. Lấy MaCLB của BCN
    const MaCLB = req.user.clubId || await getClubOfUser(pool, maND_bcn);
    if (!MaCLB) {
      return res.status(403).json({
        success: false,
        error: { message: "Bạn không có quyền quản lý BCN của câu lạc bộ nào" },
      });
    }

    // 2. Parse qrValue hoặc dùng body parameters
    let maND, maSK;
    if (qrValue) {
      const parts = qrValue.trim().split('-');
      if (parts.length === 4 && parts[0] === 'UTE' && parts[1] === 'UDN') {
        maND = parts[2].trim();
        maSK = parts[3].trim();
        if (bodyMaSK && maSK !== bodyMaSK.trim()) {
          return res.status(400).json({
            success: false,
            error: { message: `Mã QR thuộc sự kiện khác (${maSK}), không khớp với sự kiện đang chọn!` },
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: { message: "Mã QR không đúng định dạng của hệ thống UTE-UDN" },
        });
      }
    } else {
      maND = bodyMaND;
      maSK = bodyMaSK;
    }

    if (!maND || !maSK) {
      return res.status(400).json({
        success: false,
        error: { message: "Thiếu thông tin mã sinh viên hoặc mã sự kiện" },
      });
    }

    // 3. Kiểm tra sự kiện thuộc CLB của BCN
    const eventRes = await pool
      .request()
      .input("MaSK", sql.NVarChar, maSK)
      .input("MaCLB", sql.NVarChar, MaCLB)
      .query(`
        SELECT MaSK, TenSK, DiemRenLuyen, ThoiGianBatDau, ThoiGianKetThuc FROM SU_KIEN 
        WHERE MaSK = @MaSK AND MaCLB = @MaCLB
      `);

    if (eventRes.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        error: { message: "Sự kiện này không thuộc câu lạc bộ của bạn quản lý" },
      });
    }

    const tenSK = eventRes.recordset[0].TenSK;
    const now = new Date();
    const ThoiGianBatDau = new Date(eventRes.recordset[0].ThoiGianBatDau);
    const ThoiGianKetThuc = new Date(eventRes.recordset[0].ThoiGianKetThuc);

    if (now < ThoiGianBatDau) {
      return res.status(400).json({
        success: false,
        error: { message: "Sự kiện chưa diễn ra, không thể thực hiện điểm danh!" },
      });
    }

    if (now > ThoiGianKetThuc) {
      return res.status(400).json({
        success: false,
        error: { message: "Sự kiện đã kết thúc, không thể thực hiện điểm danh!" },
      });
    }

    // 4. Lấy thông tin sinh viên
    const studentRes = await pool
      .request()
      .input("MaND", sql.NVarChar, maND)
      .query(`
        SELECT hoTen, gioiTinh, anhDaiDien FROM TAI_KHOAN WHERE MaND = @MaND
      `);

    if (studentRes.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Không tìm thấy tài khoản sinh viên với mã ${maND}` },
      });
    }

    const hoTen = studentRes.recordset[0].hoTen;

    // 5. Kiểm tra đăng ký của sinh viên
    const regRes = await pool
      .request()
      .input("MaSK", sql.NVarChar, maSK)
      .input("MaND", sql.NVarChar, maND)
      .query(`
        SELECT TrangThai FROM DANGKY_SUKIEN 
        WHERE MaSK = @MaSK AND MaND = @MaND
      `);

    if (regRes.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Sinh viên ${hoTen} (${maND}) chưa đăng ký tham gia sự kiện này` },
      });
    }

    const currentStatus = regRes.recordset[0].TrangThai;

    if (currentStatus === "da_diem_danh") {
      return res.status(200).json({
        success: true,
        message: `Sinh viên ${hoTen} (${maND}) đã được điểm danh trước đó`,
        data: {
          maND,
          hoTen,
          maSK,
          tenSK,
          anhDaiDien: studentRes.recordset[0].anhDaiDien,
          gioiTinh: studentRes.recordset[0].gioiTinh,
          alreadyAttended: true,
        },
      });
    }

    if (currentStatus !== "da_duyet") {
      return res.status(400).json({
        success: false,
        error: { message: `Đăng ký của sinh viên đang ở trạng thái "${currentStatus}", không thể điểm danh.` },
      });
    }

    // 6. Cập nhật thành da_diem_danh, cộng điểm rèn luyện và gửi thông báo cho sinh viên
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const requestDK = new sql.Request(transaction);
      await requestDK
        .input("MaSK", sql.NVarChar, maSK)
        .input("MaND", sql.NVarChar, maND)
        .query(`
          UPDATE DANGKY_SUKIEN 
          SET TrangThai = 'da_diem_danh' 
          WHERE MaSK = @MaSK AND MaND = @MaND
        `);

      const diemRenLuyen = eventRes.recordset[0].DiemRenLuyen || 0;
      if (diemRenLuyen > 0) {
        const requestSV = new sql.Request(transaction);
        await requestSV
          .input("DiemCong", sql.Float, diemRenLuyen)
          .input("MaND", sql.NVarChar, maND)
          .query(`
            UPDATE SINHVIEN 
            SET diemRenLuyen = COALESCE(diemRenLuyen, 0) + @DiemCong 
            WHERE maSV = @MaND
          `);
      }

      // Tạo thông báo cho sinh viên
      const countResult = await pool.request().query("SELECT COUNT(*) AS total FROM THONG_BAO");
      const nextNum = countResult.recordset[0].total + 1;
      const maTB = `TB${nextNum.toString().padStart(9, "0")}`;

      const requestTB = new sql.Request(transaction);
      await requestTB
        .input("MaTB", sql.VarChar(13), maTB)
        .input("MaSK", sql.VarChar(13), maSK)
        .input("MaCLB", sql.VarChar(13), MaCLB)
        .input("idNguoiNhan", sql.VarChar(20), maND)
        .input("idNguoiGui", sql.VarChar(20), req.user.maND)
        .input("TieuDe", sql.NVarChar(200), "Điểm danh thành công")
        .input("NoiDung", sql.NVarChar(sql.MAX), `Bạn đã điểm danh thành công sự kiện "${tenSK}" và được cộng +${diemRenLuyen} điểm vào điểm hoạt động cá nhân.`)
        .input("LoaiTB", sql.NVarChar(50), "DiemDanh")
        .query(`
          INSERT INTO THONG_BAO 
            (MaTB, MaSuKien, MaCLB, idNguoiNhan, idNguoiGui, TieuDe, NoiDung, LoaiTB, NgayGui, TrangThai)
          VALUES
            (@MaTB, @MaSK, @MaCLB, @idNguoiNhan, @idNguoiGui, @TieuDe, @NoiDung, @LoaiTB, GETDATE(), 'da_gui')
        `);

      const requestTBND = new sql.Request(transaction);
      await requestTBND
        .input("MaTB", sql.VarChar(13), maTB)
        .input("MaND", sql.VarChar(20), maND)
        .query(`
          INSERT INTO THONG_BAO_NGUOIDUNG (MaTB, MaND, DaDoc)
          VALUES (@MaTB, @MaND, 0)
        `);

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    const diemRenLuyen = eventRes.recordset[0].DiemRenLuyen || 0;
    return res.status(200).json({
      success: true,
      message: `Sinh viên ${hoTen} (${maND}) đã được điểm danh thành công sự kiện "${tenSK}". Đã cộng +${diemRenLuyen} điểm vào điểm hoạt động.`,
      data: {
        maND,
        hoTen,
        maSK,
        tenSK,
        diemRenLuyen,
        anhDaiDien: studentRes.recordset[0].anhDaiDien,
        gioiTinh: studentRes.recordset[0].gioiTinh,
        alreadyAttended: false,
      },
    });
  } catch (err) {
    next(err);
  }
};


/**
 * Danh sách sinh viên đăng ký sự kiện (cho BCN)
 * GET /api/bcn/events/:id/participants
 */
const getEventParticipantsForBCN = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const maND_bcn = req.user.maND;

    // 1. Lấy MaCLB của BCN để bảo mật (chỉ cho phép BCN xem sự kiện của CLB họ quản lý)
    const MaCLB = req.user.clubId || await getClubOfUser(pool, maND_bcn);
    if (!MaCLB) {
      return res.status(403).json({
        success: false,
        error: { message: "Bạn không có quyền quản lý BCN của câu lạc bộ nào" },
      });
    }

    // 2. Kiểm tra sự kiện có thuộc CLB của BCN không
    const eventRes = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .input("MaCLB", sql.NVarChar, MaCLB)
      .query(`
        SELECT MaSK FROM SU_KIEN 
        WHERE MaSK = @MaSK AND MaCLB = @MaCLB
      `);

    if (eventRes.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        error: { message: "Sự kiện này không thuộc câu lạc bộ của bạn quản lý" },
      });
    }

    // 3. Lấy danh sách thành viên đăng ký
    const result = await pool
      .request()
      .input("MaSK", sql.NVarChar, id)
      .query(`
        SELECT
          RTRIM(tk.MaND)          AS maND,
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
  getEventsByClub,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  submitEventForApproval,
  markAttendance,
  getEventParticipantsForBCN,
};
