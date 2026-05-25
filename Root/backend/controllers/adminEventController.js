/**
 * Admin Event Controller
 * Xử lý toàn bộ logic CRUD sự kiện cho Ban chủ nhiệm CLB, Khoa, và Phòng CTSV
 */

const { getPool, sql } = require("../db");
const { generateEventId } = require("../utils/idGenerator");

// =====================================
// 1. GET /api/admin/events - Lấy danh sách sự kiện
// =====================================
exports.getEvents = async (req, res, next) => {
  try {
    const { userId, role, clubId } = req.user;
    const { page = 1, limit = 10, status, search } = req.query;

    const offset = (page - 1) * limit;

    // Xây dựng câu query dựa trên role
    let query = `
            SELECT 
                MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
                DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, DiemRenLuyen,
                TrangThai, LyDoTuChoi, NgayTao
            FROM SU_KIEN
            WHERE 1=1
        `;

    // Lọc theo role
    if (role === "BCN" && clubId) {
      // Ban chủ nhiệm: Chỉ lấy sự kiện của CLB của mình
      query += ` AND MaCLB = @clubId`;
    } else if (role === "KHOA") {
      // Khoa: Chỉ lấy sự kiện ở trạng thái pending_faculty
      query += ` AND TrangThai = 'pending_faculty'`;
    } else if (role === "CTSV") {
      // CTSV: Chỉ lấy sự kiện ở trạng thái pending_student_affairs
      query += ` AND TrangThai = 'pending_student_affairs'`;
    } else if (role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Invalid role for viewing events.",
        data: null,
      });
    }

    // Lọc theo status nếu có
    if (status) {
      query += ` AND TrangThai = @status`;
    }

    // Tìm kiếm theo tên sự kiện
    if (search) {
      query += ` AND TenSK LIKE @search`;
    }

    // Sắp xếp và phân trang
    const countQuery = query;
    query += ` ORDER BY NgayTao DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const pool = await getPool();
    const request = pool.request();

    // Thêm parameters
    if (role === "BCN" && clubId) {
      request.input("clubId", sql.Char(13), clubId);
    }
    if (status) {
      request.input("status", sql.NVarChar(50), status);
    }
    if (search) {
      request.input("search", sql.NVarChar(150), `%${search}%`);
    }

    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, parseInt(limit));

    // Lấy dữ liệu
    const result = await request.query(query);

    // Lấy tổng số bản ghi
    const countResult = await pool
      .request()
      .input("clubId", sql.Char(13), clubId || null)
      .input("status", sql.NVarChar(50), status || null)
      .input("search", sql.NVarChar(150), search ? `%${search}%` : null)
      .query(`SELECT COUNT(*) as total FROM (${countQuery}) as t`);

    const total = countResult.recordset[0]?.total || 0;

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: {
        events: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    next(err);
  }
};

// =====================================
// 2. POST /api/admin/events - BCN thêm sự kiện mới
// =====================================
exports.createEvent = async (req, res, next) => {
  try {
    const { userId, role, clubId } = req.user;

    // Chỉ BCN mới có quyền tạo sự kiện
    if (role !== "BCN" || !clubId) {
      return res.status(403).json({
        success: false,
        message: "Only club leaders (BCN) can create events",
        data: null,
      });
    }

    // Validate input
    const {
      name,
      description,
      startTime,
      endTime,
      location,
      quota,
      points,
      costEstimate,
      eventType,
    } = req.body;

    if (!name || !startTime || !endTime || !location || !quota) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, startTime, endTime, location, quota",
        data: null,
      });
    }

    // Kiểm tra logic ngày tháng
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
        data: null,
      });
    }

    // Sinh ID tự động
    const maSK = generateEventId(
      new Date().getFullYear(),
      0,
      Math.floor(Math.random() * 10000),
    );

    const pool = await getPool();
    const request = pool.request();

    // Thêm sự kiện mới (mặc định trạng thái là draft)
    const query = `
            INSERT INTO SU_KIEN (
                MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
                DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, DiemRenLuyen,
                TrangThai, NgayTao
            )
            VALUES (
                @maSK, @maCLB, @tenSK, @moTa, @thoiGianBatDau, @thoiGianKetThuc,
                @diaDiem, @soNguoiToiDa, @chiPhiDuKien, @loaiSK, @diemRenLuyen,
                @trangThai, GETDATE()
            )
        `;

    request
      .input("maSK", sql.Char(13), maSK)
      .input("maCLB", sql.Char(13), clubId)
      .input("tenSK", sql.NVarChar(150), name)
      .input("moTa", sql.NVarChar(sql.MAX), description || null)
      .input("thoiGianBatDau", sql.DateTime, start)
      .input("thoiGianKetThuc", sql.DateTime, end)
      .input("diaDiem", sql.NVarChar(200), location)
      .input("soNguoiToiDa", sql.Int, parseInt(quota))
      .input("chiPhiDuKien", sql.Decimal(18, 2), parseFloat(costEstimate || 0))
      .input("loaiSK", sql.NVarChar(50), eventType || "Khác")
      .input("diemRenLuyen", sql.Float, parseFloat(points || 0))
      .input("trangThai", sql.NVarChar(50), "draft");

    await request.query(query);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        eventId: maSK,
        event: {
          MaSK: maSK,
          MaCLB: clubId,
          TenSK: name,
          MoTa: description,
          ThoiGianBatDau: start,
          ThoiGianKetThuc: end,
          DiaDiem: location,
          SoNguoiToiDa: parseInt(quota),
          ChiPhiDuKien: parseFloat(costEstimate || 0),
          LoaiSK: eventType || "Khác",
          DiemRenLuyen: parseFloat(points || 0),
          TrangThai: "draft",
        },
      },
    });
  } catch (err) {
    console.error("❌ Error creating event:", err);
    next(err);
  }
};

// =====================================
// 3. PUT /api/admin/events/:id - BCN sửa sự kiện
// =====================================
exports.updateEvent = async (req, res, next) => {
  try {
    const { userId, role, clubId } = req.user;
    const { id } = req.params;

    // Chỉ BCN mới có quyền sửa sự kiện
    if (role !== "BCN" || !clubId) {
      return res.status(403).json({
        success: false,
        message: "Only club leaders (BCN) can update events",
        data: null,
      });
    }

    const pool = await getPool();

    // Lấy thông tin sự kiện hiện tại
    const getQuery = `SELECT * FROM SU_KIEN WHERE MaSK = @maSK`;
    const getResult = await pool
      .request()
      .input("maSK", sql.Char(13), id)
      .query(getQuery);

    if (getResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        data: null,
      });
    }

    const event = getResult.recordset[0];

    // Kiểm tra sự kiện thuộc CLB của user
    if (event.MaCLB !== clubId) {
      return res.status(403).json({
        success: false,
        message: "You can only update events in your club",
        data: null,
      });
    }

    // Kiểm tra trạng thái: Chỉ có thể sửa nếu trạng thái là 'draft' hoặc 'rejected'
    if (event.TrangThai !== "draft" && event.TrangThai !== "rejected") {
      return res.status(400).json({
        success: false,
        message: `Cannot update event with status '${event.TrangThai}'. Only 'draft' or 'rejected' events can be updated.`,
        data: null,
      });
    }

    // Validate input
    const {
      name,
      description,
      startTime,
      endTime,
      location,
      quota,
      points,
      costEstimate,
      eventType,
    } = req.body;

    if (!name || !startTime || !endTime || !location || !quota) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, startTime, endTime, location, quota",
        data: null,
      });
    }

    // Kiểm tra logic ngày tháng
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
        data: null,
      });
    }

    // Cập nhật sự kiện
    const updateQuery = `
            UPDATE SU_KIEN
            SET
                TenSK = @tenSK,
                MoTa = @moTa,
                ThoiGianBatDau = @thoiGianBatDau,
                ThoiGianKetThuc = @thoiGianKetThuc,
                DiaDiem = @diaDiem,
                SoNguoiToiDa = @soNguoiToiDa,
                ChiPhiDuKien = @chiPhiDuKien,
                LoaiSK = @loaiSK,
                DiemRenLuyen = @diemRenLuyen,
                TrangThai = 'draft'
            WHERE MaSK = @maSK
        `;

    const request = pool.request();
    request
      .input("maSK", sql.Char(13), id)
      .input("tenSK", sql.NVarChar(150), name)
      .input("moTa", sql.NVarChar(sql.MAX), description || null)
      .input("thoiGianBatDau", sql.DateTime, start)
      .input("thoiGianKetThuc", sql.DateTime, end)
      .input("diaDiem", sql.NVarChar(200), location)
      .input("soNguoiToiDa", sql.Int, parseInt(quota))
      .input("chiPhiDuKien", sql.Decimal(18, 2), parseFloat(costEstimate || 0))
      .input("loaiSK", sql.NVarChar(50), eventType || "Khác")
      .input("diemRenLuyen", sql.Float, parseFloat(points || 0));

    await request.query(updateQuery);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: {
        eventId: id,
        event: {
          MaSK: id,
          MaCLB: clubId,
          TenSK: name,
          MoTa: description,
          ThoiGianBatDau: start,
          ThoiGianKetThuc: end,
          DiaDiem: location,
          SoNguoiToiDa: parseInt(quota),
          ChiPhiDuKien: parseFloat(costEstimate || 0),
          LoaiSK: eventType || "Khác",
          DiemRenLuyen: parseFloat(points || 0),
          TrangThai: "draft",
        },
      },
    });
  } catch (err) {
    console.error("❌ Error updating event:", err);
    next(err);
  }
};

// =====================================
// 4. DELETE /api/admin/events/:id - BCN xóa sự kiện
// =====================================
exports.deleteEvent = async (req, res, next) => {
  try {
    const { userId, role, clubId } = req.user;
    const { id } = req.params;

    // Chỉ BCN mới có quyền xóa sự kiện
    if (role !== "BCN" || !clubId) {
      return res.status(403).json({
        success: false,
        message: "Only club leaders (BCN) can delete events",
        data: null,
      });
    }

    const pool = await getPool();

    // Lấy thông tin sự kiện hiện tại
    const getQuery = `SELECT * FROM SU_KIEN WHERE MaSK = @maSK`;
    const getResult = await pool
      .request()
      .input("maSK", sql.Char(13), id)
      .query(getQuery);

    if (getResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        data: null,
      });
    }

    const event = getResult.recordset[0];

    // Kiểm tra sự kiện thuộc CLB của user
    if (event.MaCLB !== clubId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete events in your club",
        data: null,
      });
    }

    // Kiểm tra trạng thái: Chỉ có thể xóa nếu trạng thái là 'draft' hoặc 'rejected'
    if (event.TrangThai !== "draft" && event.TrangThai !== "rejected") {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event with status '${event.TrangThai}'. Only 'draft' or 'rejected' events can be deleted.`,
        data: null,
      });
    }

    // Xóa sự kiện
    const deleteQuery = `DELETE FROM SU_KIEN WHERE MaSK = @maSK`;
    await pool.request().input("maSK", sql.Char(13), id).query(deleteQuery);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: {
        eventId: id,
      },
    });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    next(err);
  }
};

// =====================================
// 5. PATCH /api/admin/events/:id/review - KHOA/CTSV duyệt sự kiện
// =====================================
exports.reviewEvent = async (req, res, next) => {
  try {
    const { userId, role, clubId } = req.user;
    const { id } = req.params;
    const { status, feedback } = req.body;

    // Chỉ KHOA hoặc CTSV mới có quyền duyệt sự kiện
    if (!["KHOA", "CTSV"].includes(role)) {
      return res.status(403).json({
        success: false,
        message:
          "Only Faculty (KHOA) or Student Affairs (CTSV) can review events",
        data: null,
      });
    }

    // Validate status
    const validStatuses = ["approved", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
        data: null,
      });
    }

    const pool = await getPool();

    // Lấy thông tin sự kiện hiện tại
    const getQuery = `SELECT * FROM SU_KIEN WHERE MaSK = @maSK`;
    const getResult = await pool
      .request()
      .input("maSK", sql.Char(13), id)
      .query(getQuery);

    if (getResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        data: null,
      });
    }

    const event = getResult.recordset[0];

    // Kiểm tra trạng thái: Chỉ có thể duyệt nếu trạng thái là 'pending_faculty' hoặc 'pending_student_affairs'
    if (role === "KHOA" && event.TrangThai !== "pending_faculty") {
      return res.status(400).json({
        success: false,
        message: `Faculty can only review events with status 'pending_faculty'. Current status: ${event.TrangThai}`,
        data: null,
      });
    }

    if (role === "CTSV" && event.TrangThai !== "pending_student_affairs") {
      return res.status(400).json({
        success: false,
        message: `Student Affairs can only review events with status 'pending_student_affairs'. Current status: ${event.TrangThai}`,
        data: null,
      });
    }

    // Cập nhật trạng thái sự kiện
    // ── Tính trạng thái mới theo role + action ──────────────────
// Flow: draft → pending_faculty → pending_student_affairs → approved
//                             ↘ rejected              ↘ rejected
let newStatus;
if (status === "rejected") {
  newStatus = "rejected";
} else if (role === "KHOA") {
  newStatus = "pending_student_affairs"; // KHOA duyệt → chuyển lên CTSV
} else if (role === "CTSV") {
  newStatus = "approved"; // CTSV duyệt → hoàn tất
}

// ── Cập nhật DB ──────────────────────────────────────────────
const updateQuery = `
  UPDATE SU_KIEN
  SET
    TrangThai  = @newStatus,
    LyDoTuChoi = @feedback
  WHERE MaSK = @maSK
`;

const request = pool.request();
request
  .input("maSK",      sql.Char(13),         id)
  .input("newStatus", sql.NVarChar(50),      newStatus)  // ← dùng newStatus thay vì status
  .input("feedback",  sql.NVarChar(sql.MAX), feedback || null);

    await request.query(updateQuery);

    return res.status(200).json({
      success: true,
      message: `Event ${newStatus} successfully`,
      data: {
        eventId: id,
        newStatus: newStatus,
        feedback: feedback || null,
      },
    });
  } catch (err) {
    console.error("❌ Error reviewing event:", err);
    next(err);
  }
};

// =====================================
// 6. GET /api/admin/events/:id - Lấy chi tiết sự kiện
// =====================================
exports.getEventDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role, clubId } = req.user;

    const pool = await getPool();

    // Lấy thông tin sự kiện
    const query = `
      SELECT 
        sk.MaSK, sk.MaCLB, sk.TenSK, sk.MoTa, sk.ThoiGianBatDau, sk.ThoiGianKetThuc,
        sk.DiaDiem, sk.SoNguoiToiDa, sk.ChiPhiDuKien, sk.LoaiSK, sk.DiemRenLuyen,
        sk.TrangThai, sk.LyDoTuChoi, sk.NgayTao,
        clb.TenCLB
      FROM SU_KIEN sk
      LEFT JOIN CAULACBO clb ON sk.MaCLB = clb.MaCLB
      WHERE sk.MaSK = @maSK
    `;

    const result = await pool
      .request()
      .input("maSK", sql.Char(13), id)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        data: null,
      });
    }

    const event = result.recordset[0];

    // Kiểm tra quyền truy cập
    if (role === "BCN" && event.MaCLB !== clubId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this event",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (err) {
    console.error("❌ Error fetching event detail:", err);
    next(err);
  }
};
