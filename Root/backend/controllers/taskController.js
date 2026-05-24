const { getPool, sql } = require("../db");

// Helper tạo mã Nhiệm vụ (MaNV) tự động tăng
const generateMaNV = async (pool) => {
  const result = await pool.request().query(`
    SELECT TOP 1 MaNV FROM NHIEM_VU WHERE MaNV LIKE 'NV%' ORDER BY MaNV DESC
  `);
  if (result.recordset.length === 0) return "NV000000001";
  const lastNum = parseInt(result.recordset[0].MaNV.replace("NV", ""), 10);
  return `NV${String(lastNum + 1).padStart(9, "0")}`;
};

// 1. Lấy danh sách nhiệm vụ của 1 Sự kiện
const getTasksByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const pool = await getPool();

    const result = await pool.request().input("MaSK", sql.NVarChar(13), eventId)
      .query(`
        SELECT 
          NV.MaNV as id, NV.TenNV as title, NV.MoTa as description, 
          NV.HanChot as deadline, NV.TrangThai as status,
          NV.FileBaoCao as submissionLink, NV.GhiChuBaoCao as submissionNote,
          NV.PhanHoiCuaBCN as bcnFeedback, NV.NgayNopBaoCao as submittedAt,
          NV.FileDinhKem as attachmentLink, -- LẤY THÊM TRƯỜNG NÀY
          TV.MaTV, TK.hoTen as assigneeName, TK.anhDaiDien, TV.VaiTroCLB as assigneeRole
        FROM NHIEM_VU NV
        INNER JOIN THANH_VIEN TV ON NV.MaTV_PhuTrach = TV.MaTV
        INNER JOIN TAI_KHOAN TK ON TV.MaND = TK.MaND
        WHERE NV.MaSK = @MaSK
        ORDER BY NV.HanChot ASC
      `);

    const tasks = result.recordset.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      deadline: row.deadline,
      status: row.status,
      submissionLink: row.submissionLink,
      submissionNote: row.submissionNote,
      bcnFeedback: row.bcnFeedback,
      submittedAt: row.submittedAt,
      attachmentLink: row.attachmentLink, // MAP THÊM TRƯỜNG NÀY
      assignee: {
        id: row.MaTV,
        name: row.assigneeName,
        role: row.assigneeRole,
        avatar: row.anhDaiDien || "👤",
      },
    }));

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// 2. Lấy danh sách Thành viên CLB (loại trừ chính người đang phân công)
const getClubMembersForAssign = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const pool = await getPool();
    const currentUserId = req.user.maND; // Lấy ID của BCN hiện tại

    const result = await pool.request()
      .input("MaCLB", sql.NVarChar(13), clubId)
      .input("MaND", sql.NVarChar(13), currentUserId)
      .query(`
        SELECT TV.MaTV as id, TK.hoTen as name, TV.VaiTroCLB as role, TK.anhDaiDien as avatar
        FROM THANH_VIEN TV
        INNER JOIN TAI_KHOAN TK ON TV.MaND = TK.MaND
        WHERE TV.MaCLB = @MaCLB 
          AND TV.TrangThai = N'Hoạt động'
          AND TV.MaND != @MaND
      `);

    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
};

// 3. Tạo nhiệm vụ mới (BCN)
const createTask = async (req, res, next) => {
  try {
    // Không còn attachmentLink trong req.body nữa
    const { MaSK, MaCLB, title, description, assigneeId, deadline } = req.body;
    const pool = await getPool();
    const nguoiGiaoID = req.user.maND;

    // Validate input
    if (!MaSK || !MaCLB || !title || !assigneeId || !deadline) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Vui lòng điền đầy đủ thông tin bắt buộc",
        },
      });
    }

    // NẾU CÓ FILE ĐƯỢC TẢI LÊN, TẠO ĐƯỜNG DẪN ĐẦY ĐỦ ĐỂ FRONTEND CÓ THỂ ĐỌC ĐƯỢC
    let attachmentLink = null;
    if (req.file) {
      // req.file.filename là tên file vừa được multer lưu lại
      const protocol = req.protocol || "http";
      const host = req.get("host");
      attachmentLink = `${protocol}://${host}/uploads/${req.file.filename}`;
      console.log("✓ File uploaded successfully:");
      console.log("  - Filename:", req.file.filename);
      console.log("  - Size:", req.file.size, "bytes");
      console.log("  - Path:", req.file.path);
      console.log("  - URL:", attachmentLink);
    }

    const MaNV = await generateMaNV(pool);

    await pool
      .request()
      .input("MaNV", sql.NVarChar(13), MaNV)
      .input("MaCLB", sql.NVarChar(13), MaCLB)
      .input("MaSK", sql.NVarChar(13), MaSK)
      .input("TenNV", sql.NVarChar(200), title)
      .input("MoTa", sql.NVarChar(sql.MAX), description || null)
      .input("MaTV_PhuTrach", sql.NVarChar(13), assigneeId)
      .input("NguoiGiaoID", sql.NVarChar(13), nguoiGiaoID)
      .input("HanChot", sql.DateTime, new Date(deadline))
      .input("TrangThai", sql.NVarChar(50), "todo")
      .input("FileDinhKem", sql.NVarChar(255), attachmentLink) // LƯU ĐƯỜNG DẪN VÀO DB
      .query(`
        INSERT INTO NHIEM_VU (MaNV, MaCLB, MaSK, TenNV, MoTa, MaTV_PhuTrach, NguoiGiaoID, HanChot, TrangThai, FileDinhKem)
        VALUES (@MaNV, @MaCLB, @MaSK, @TenNV, @MoTa, @MaTV_PhuTrach, @NguoiGiaoID, @HanChot, @TrangThai, @FileDinhKem)
      `);

    console.log("✓ Task created successfully:", MaNV);
    res.status(201).json({
      success: true,
      message: "Tạo nhiệm vụ thành công",
      data: {
        MaNV,
        attachmentLink,
      },
    });
  } catch (err) {
    console.error("✗ Error creating task:", err);
    next(err);
  }
};

// 4. BCN duyệt hoặc yêu cầu làm lại
const reviewTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input("MaNV", sql.NVarChar(13), id)
      .input("TrangThai", sql.NVarChar(50), status)
      .input("PhanHoiCuaBCN", sql.NVarChar(sql.MAX), feedback || null).query(`
        UPDATE NHIEM_VU 
        SET TrangThai = @TrangThai, PhanHoiCuaBCN = @PhanHoiCuaBCN
        WHERE MaNV = @MaNV
      `);

    res
      .status(200)
      .json({ success: true, message: "Đã cập nhật trạng thái nhiệm vụ" });
  } catch (err) {
    next(err);
  }
};

// 5. Xóa nhiệm vụ
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    await pool
      .request()
      .input("MaNV", sql.NVarChar(13), id)
      .query(`DELETE FROM NHIEM_VU WHERE MaNV = @MaNV`);
    res.status(200).json({ success: true, message: "Đã xóa nhiệm vụ" });
  } catch (err) {
    next(err);
  }
};

// ========== STUDENT FUNCTIONS ==========

// 6. Lấy danh sách nhiệm vụ của sinh viên (dựa trên thành viên CLB)
const getStudentTasks = async (req, res, next) => {
  try {
    const studentId = req.user.maND; // Lấy ID của user hiện tại
    const pool = await getPool();

    // Tìm MaTV (mã thành viên) của sinh viên hiện tại
    const tvResult = await pool
      .request()
      .input("MaND", sql.NVarChar(13), studentId)
      .query(`SELECT MaTV FROM THANH_VIEN WHERE MaND = @MaND`);

    if (tvResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Sinh viên không phải là thành viên của CLB nào",
        },
      });
    }

    const maTV = tvResult.recordset[0].MaTV;

    // Lấy danh sách nhiệm vụ được giao cho sinh viên này
    const result = await pool.request().input("MaTV", sql.NVarChar(13), maTV)
      .query(`
        SELECT 
          NV.MaNV as id, NV.TenNV as title, NV.MoTa as description, 
          NV.HanChot as deadline, NV.TrangThai as status,
          NV.FileBaoCao as submissionLink, NV.GhiChuBaoCao as submissionNote,
          NV.PhanHoiCuaBCN as bcnFeedback, NV.NgayNopBaoCao as submittedAt,
          NV.FileDinhKem as attachmentLink,
          SK.TenSK as eventName, SK.MaSK,
          CLB.TenCLB as clubName, CLB.MaCLB,
          TK.hoTen as assignerName
        FROM NHIEM_VU NV
        INNER JOIN THANH_VIEN TV ON NV.MaTV_PhuTrach = TV.MaTV
        INNER JOIN SU_KIEN SK ON NV.MaSK = SK.MaSK
        INNER JOIN CAULACBO CLB ON NV.MaCLB = CLB.MaCLB
        INNER JOIN TAI_KHOAN TK ON NV.NguoiGiaoID = TK.MaND
        WHERE NV.MaTV_PhuTrach = @MaTV
        ORDER BY NV.HanChot ASC
      `);

    const tasks = result.recordset.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      deadline: row.deadline,
      status: row.status,
      submissionLink: row.submissionLink,
      submissionNote: row.submissionNote,
      bcnFeedback: row.bcnFeedback,
      submittedAt: row.submittedAt,
      attachmentLink: row.attachmentLink,
      eventName: row.eventName,
      eventId: row.MaSK,
      clubName: row.clubName,
      clubId: row.MaCLB,
      assignerName: row.assignerName,
    }));

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// 7. Sinh viên gửi báo cáo (submit task)
const submitTaskReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { submissionNote } = req.body;
    const pool = await getPool();

    // Xác định submissionLink từ file upload
    let submissionLink = null;
    if (req.file) {
      const protocol = req.protocol || "http";
      const host = req.get("host");
      submissionLink = `${protocol}://${host}/uploads/${req.file.filename}`;
      console.log("✓ Report file uploaded successfully:", submissionLink);
    }

    // Validate input
    if (!submissionNote || !submissionNote.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Vui lòng nhập ghi chú báo cáo",
        },
      });
    }

    // Update NHIEM_VU table
    await pool
      .request()
      .input("MaNV", sql.NVarChar(13), id)
      .input("FileBaoCao", sql.NVarChar(255), submissionLink)
      .input("GhiChuBaoCao", sql.NVarChar(sql.MAX), submissionNote)
      .input("NgayNopBaoCao", sql.DateTime, new Date())
      .input("TrangThai", sql.NVarChar(50), "reviewing").query(`
        UPDATE NHIEM_VU 
        SET FileBaoCao = @FileBaoCao, 
            GhiChuBaoCao = @GhiChuBaoCao, 
            NgayNopBaoCao = @NgayNopBaoCao,
            TrangThai = @TrangThai
        WHERE MaNV = @MaNV
      `);

    console.log("✓ Task report submitted successfully:", id);
    res.status(200).json({
      success: true,
      message: "Báo cáo nhiệm vụ đã được gửi cho Ban chủ nhiệm",
      data: {
        MaNV: id,
        submissionLink,
      },
    });
  } catch (err) {
    console.error("✗ Error submitting task report:", err);
    next(err);
  }
};

module.exports = {
  getTasksByEvent,
  getClubMembersForAssign,
  createTask,
  reviewTask,
  deleteTask,
  getStudentTasks,
  submitTaskReport,
};
