const { getPool } = require("../db/index");
const sql = require("mssql");

/**
 * Lấy maDVQL của Cán bộ Khoa từ bảng CANBO
 */
async function getDVQLOfCanBo(pool, maND) {
  const result = await pool.request()
    .input("MaND", sql.VarChar(13), maND)
    .query(`
      SELECT maDVQL 
      FROM CANBO 
      WHERE maCanBo = @MaND AND trangThai = 1
    `);
  return result.recordset.length > 0 ? result.recordset[0].maDVQL : null;
}

/**
 * GET /api/clubs/units
 * Lấy danh sách các Đơn vị quản lý để hiển thị lên dropdown
 */
async function getUnits(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT maDVQL, tenDVQL 
      FROM DONVIQUANLY
      ORDER BY tenDVQL ASC
    `);
    return res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/clubs/register
 * Sinh viên nộp đơn đăng ký mở CLB mới (qua Form online)
 */
async function registerClub(req, res, next) {
  try {
    const { tenCLB, linhVuc, maDVQL, noiDungHoSo } = req.body;
    const maND = req.user.maND;

    if (!tenCLB || !linhVuc || !maDVQL || !noiDungHoSo) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ các thông tin bắt buộc.",
      });
    }

    const pool = await getPool();

    // Kiểm tra xem tên CLB đã được đăng ký và chưa bị từ chối chưa
    const checkName = await pool.request()
      .input("tenCLB", sql.NVarChar(150), tenCLB)
      .query(`
        SELECT MaDKMo FROM DANGKY_MO_CLB 
        WHERE TenCLB = @tenCLB AND TrangThai != N'rejected'
      `);

    if (checkName.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Tên câu lạc bộ này đã được đăng ký hoặc đang chờ duyệt.",
      });
    }

    // Kiểm tra xem có CLB hoạt động nào trùng tên chưa
    const checkActive = await pool.request()
      .input("tenCLB", sql.NVarChar(100), tenCLB)
      .query(`
        SELECT MaCLB FROM CAULACBO WHERE TenCLB = @tenCLB AND TrangThai = N'Hoạt động'
      `);

    if (checkActive.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Tên câu lạc bộ này đã tồn tại trên hệ thống.",
      });
    }

    // Tạo MaDKMo dạng DKM + 10 ký tự timestamp
    const maDKMo = "DKM" + Date.now().toString().slice(-10);
    const jsonStr = typeof noiDungHoSo === "string" ? noiDungHoSo : JSON.stringify(noiDungHoSo);

    // Nếu đơn vị quản lý là Phòng CTSV (DVQL0000006), chuyển thẳng trạng thái chờ CTSV duyệt và tự động thông qua Khoa
    const isCtsvDirect = (maDVQL === "DVQL0000006");
    const initialStatus = isCtsvDirect ? "pending_student_affairs" : "pending_faculty";
    const khoaDuyetVal = isCtsvDirect ? 1 : 0;
    const message = isCtsvDirect 
      ? "Nộp hồ sơ đăng ký thành lập CLB thành công! Hồ sơ đã được chuyển thẳng tới Phòng CTSV để thẩm định."
      : "Nộp hồ sơ đăng ký thành lập CLB thành công! Vui lòng chờ Khoa/Đơn vị quản lý phê duyệt.";

    await pool.request()
      .input("maDKMo", sql.VarChar(13), maDKMo)
      .input("maND", sql.VarChar(13), maND)
      .input("maDVQL", sql.VarChar(13), maDVQL)
      .input("tenCLB", sql.NVarChar(150), tenCLB)
      .input("linhVuc", sql.NVarChar(50), linhVuc)
      .input("noiDungHoSo", sql.NVarChar(sql.MAX), jsonStr)
      .input("trangThai", sql.NVarChar(50), initialStatus)
      .input("khoaDuyet", sql.Bit, khoaDuyetVal)
      .query(`
        INSERT INTO DANGKY_MO_CLB (MaDKMo, MaND, MaDVQL, TenCLB, LinhVuc, NoiDungHoSo, TrangThai, KhoaDuyet)
        VALUES (@maDKMo, @maND, @maDVQL, @tenCLB, @linhVuc, @noiDungHoSo, @trangThai, @khoaDuyet)
      `);

    return res.status(201).json({
      success: true,
      message,
      data: { maDKMo },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/clubs/my-registrations
 * Sinh viên xem lại các đơn mình đã nộp
 */
async function getMyRegistrations(req, res, next) {
  try {
    const maND = req.user.maND;
    const pool = await getPool();

    const result = await pool.request()
      .input("maND", sql.VarChar(13), maND)
      .query(`
        SELECT dk.*, dv.tenDVQL 
        FROM DANGKY_MO_CLB dk
        JOIN DONVIQUANLY dv ON dk.MaDVQL = dv.maDVQL
        WHERE dk.MaND = @maND
        ORDER BY dk.NgayTao DESC
      `);

    const list = result.recordset.map(row => {
      try {
        row.NoiDungHoSo = JSON.parse(row.NoiDungHoSo);
      } catch (e) {}
      return row;
    });

    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/clubs/admin/registrations
 * Lấy danh sách các đơn đăng ký mở CLB cho Cán bộ Khoa/CTSV duyệt
 */
async function getRegistrations(req, res, next) {
  try {
    const role = req.user.role;
    const maND = req.user.maND;
    const pool = await getPool();
    let query = "";

    if (role === "KHOA") {
      const maDVQL = await getDVQLOfCanBo(pool, maND);
      if (!maDVQL) {
        return res.status(403).json({
          success: false,
          message: "Tài khoản cán bộ Khoa chưa được gán Đơn vị quản lý.",
        });
      }
      // Khoa chỉ xem đơn thuộc khoa mình quản lý
      query = `
        SELECT dk.*, dv.tenDVQL, tk.hoTen as NguoiDangKy
        FROM DANGKY_MO_CLB dk
        JOIN DONVIQUANLY dv ON dk.MaDVQL = dv.maDVQL
        JOIN TAI_KHOAN tk ON dk.MaND = tk.MaND
        WHERE dk.MaDVQL = @maDVQL
        ORDER BY dk.NgayTao DESC
      `;
      const result = await pool.request()
        .input("maDVQL", sql.VarChar(13), maDVQL)
        .query(query);

      const list = result.recordset.map(row => {
        try {
          row.NoiDungHoSo = JSON.parse(row.NoiDungHoSo);
        } catch (e) {}
        return row;
      });

      return res.status(200).json({
        success: true,
        data: list,
      });

    } else if (role === "CTSV") {
      // CTSV xem tất cả các đơn
      query = `
        SELECT dk.*, dv.tenDVQL, tk.hoTen as NguoiDangKy
        FROM DANGKY_MO_CLB dk
        JOIN DONVIQUANLY dv ON dk.MaDVQL = dv.maDVQL
        JOIN TAI_KHOAN tk ON dk.MaND = tk.MaND
        ORDER BY dk.NgayTao DESC
      `;
      const result = await pool.request().query(query);

      const list = result.recordset.map(row => {
        try {
          row.NoiDungHoSo = JSON.parse(row.NoiDungHoSo);
        } catch (e) {}
        return row;
      });

      return res.status(200).json({
        success: true,
        data: list,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập.",
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/clubs/admin/registrations/:id/review
 * Duyệt hoặc từ chối đơn thành lập CLB
 */
async function reviewRegistration(req, res, next) {
  const transaction = new sql.Transaction();
  try {
    const { id } = req.params;
    const { status, feedback } = req.body; // status: 'approved' | 'rejected'
    const role = req.user.role;
    const maND = req.user.maND;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái phê duyệt không hợp lệ.",
      });
    }

    const pool = await getPool();

    // Lấy thông tin đơn đăng ký hiện tại
    const dkResult = await pool.request()
      .input("id", sql.VarChar(13), id)
      .query(`
        SELECT * FROM DANGKY_MO_CLB WHERE MaDKMo = @id
      `);

    if (dkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hồ sơ đăng ký không tồn tại.",
      });
    }

    const registration = dkResult.recordset[0];

    if (role === "KHOA") {
      const maDVQL = await getDVQLOfCanBo(pool, maND);
      if (!maDVQL || registration.MaDVQL !== maDVQL) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền duyệt hồ sơ của khoa khác.",
        });
      }

      if (registration.TrangThai !== "pending_faculty") {
        return res.status(400).json({
          success: false,
          message: "Hồ sơ này không ở trạng thái chờ Khoa duyệt.",
        });
      }

      if (status === "approved") {
        await pool.request()
          .input("id", sql.VarChar(13), id)
          .query(`
            UPDATE DANGKY_MO_CLB 
            SET KhoaDuyet = 1, TrangThai = N'pending_student_affairs', LyDoTuChoi = NULL
            WHERE MaDKMo = @id
          `);
        return res.status(200).json({
          success: true,
          message: "Khoa phê duyệt hồ sơ thành công! Đã gửi lên Phòng CTSV.",
        });
      } else {
        await pool.request()
          .input("id", sql.VarChar(13), id)
          .input("feedback", sql.NVarChar(sql.MAX), feedback || "")
          .query(`
            UPDATE DANGKY_MO_CLB 
            SET KhoaDuyet = 0, TrangThai = N'rejected', LyDoTuChoi = @feedback
            WHERE MaDKMo = @id
          `);
        return res.status(200).json({
          success: true,
          message: "Khoa đã từ chối hồ sơ thành công.",
        });
      }

    } else if (role === "CTSV") {
      if (registration.TrangThai !== "pending_student_affairs") {
        return res.status(400).json({
          success: false,
          message: "Hồ sơ này không ở trạng thái chờ Phòng CTSV duyệt.",
        });
      }

      if (status === "approved") {
        // Duyệt hoàn toàn: Kích hoạt tạo CLB mới + Bổ nhiệm chủ nhiệm
        await transaction.begin();

        // 1. Cập nhật đơn đăng ký
        await transaction.request()
          .input("id", sql.VarChar(13), id)
          .query(`
            UPDATE DANGKY_MO_CLB 
            SET PhongCTSVDuyet = 1, TrangThai = N'approved', LyDoTuChoi = NULL
            WHERE MaDKMo = @id
          `);

        // 2. Tạo Câu lạc bộ mới
        const maCLB = "CLB" + Date.now().toString().slice(-10);
        let moTaCLB = "";
        let tenTiengAnh = "";
        let tenVietTat = "";
        let slogan = "";
        let tonChiMucDich = "";
        let phamViHoatDong = "";
        let quyenLoiTrachNhiem = "";

        try {
          const detail = JSON.parse(registration.NoiDungHoSo);
          moTaCLB = detail.step2?.gioiThieu || detail.step1?.tinhCapThiet || "";
          tenTiengAnh = detail.step2?.tenTiengAnh || "";
          tenVietTat = detail.step2?.tenVietTat || "";
          slogan = detail.step2?.slogan || "";
          tonChiMucDich = detail.step2?.tonChiMucDich || "";
          phamViHoatDong = detail.step2?.phamViHoatDong || "";
          quyenLoiTrachNhiem = detail.step2?.quyenLoiTrachNhiem || "";
        } catch (e) {
          moTaCLB = registration.TenCLB;
        }

        await transaction.request()
          .input("maCLB", sql.VarChar(13), maCLB)
          .input("maDVQL", sql.VarChar(13), registration.MaDVQL)
          .input("tenCLB", sql.NVarChar(100), registration.TenCLB)
          .input("moTa", sql.NVarChar(sql.MAX), moTaCLB)
          .input("linhVuc", sql.NVarChar(50), registration.LinhVuc)
          .input("tenTiengAnh", sql.NVarChar(150), tenTiengAnh)
          .input("tenVietTat", sql.NVarChar(20), tenVietTat)
          .input("slogan", sql.NVarChar(200), slogan)
          .input("tonChiMucDich", sql.NVarChar(sql.MAX), tonChiMucDich)
          .input("phamViHoatDong", sql.NVarChar(sql.MAX), phamViHoatDong)
          .input("quyenLoiTrachNhiem", sql.NVarChar(sql.MAX), quyenLoiTrachNhiem)
          .query(`
            INSERT INTO CAULACBO (
              MaCLB, maDVQL, TenCLB, MoTa, Logo, NgayThanhLap, SoThanhVienToiDa, LinhVuc, TrangThai,
              TenTiengAnh, TenVietTat, Slogan, TonChiMucDich, PhamViHoatDong, QuyenLoiTrachNhiem
            )
            VALUES (
              @maCLB, @maDVQL, @tenCLB, @moTa, NULL, CAST(GETDATE() AS DATE), 100, @linhVuc, N'Hoạt động',
              @tenTiengAnh, @tenVietTat, @slogan, @tonChiMucDich, @phamViHoatDong, @quyenLoiTrachNhiem
            )
          `);

        // 3. Bổ nhiệm Sinh viên làm Chủ nhiệm của CLB mới tạo
        // MaTV = TV + 10 ký tự ngẫu nhiên
        const maTV = "TV" + Date.now().toString().slice(-10) + Math.floor(Math.random() * 10);
        await transaction.request()
          .input("maTV", sql.VarChar(13), maTV)
          .input("maCLB", sql.VarChar(13), maCLB)
          .input("maND", sql.VarChar(13), registration.MaND)
          .query(`
            INSERT INTO THANH_VIEN (MaTV, MaCLB, MaND, VaiTroCLB, NgayThamGia, TrangThai, DiemDongGop)
            VALUES (@maTV, @maCLB, @maND, N'Chủ nhiệm', CAST(GETDATE() AS DATE), N'Hoạt động', 0)
          `);

        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: "Phòng CTSV phê duyệt thành lập CLB thành công! Đã tự động tạo CLB và bổ nhiệm Chủ nhiệm.",
        });
      } else {
        // Từ chối đơn
        await pool.request()
          .input("id", sql.VarChar(13), id)
          .input("feedback", sql.NVarChar(sql.MAX), feedback || "")
          .query(`
            UPDATE DANGKY_MO_CLB 
            SET PhongCTSVDuyet = 0, TrangThai = N'rejected', LyDoTuChoi = @feedback
            WHERE MaDKMo = @id
          `);
        return res.status(200).json({
          success: true,
          message: "Phòng CTSV đã từ chối hồ sơ thành công.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Không có quyền duyệt đơn đăng ký thành lập CLB.",
      });
    }
  } catch (error) {
    if (transaction.isOpen) {
      await transaction.rollback();
    }
    next(error);
  }
}

module.exports = {
  getUnits,
  registerClub,
  getMyRegistrations,
  getRegistrations,
  reviewRegistration,
};
