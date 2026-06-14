const { getPool, sql } = require("./db");

async function testGetEventsForRoles() {
  try {
    const pool = await getPool();
    console.log("Database connected.");

    // Giả lập role = KHOA (CB000000002)
    const userKhoa = { maND: "CB000000002", role: "KHOA" };
    console.log("--- Testing getEvents for KHOA (CB000000002) ---");
    const resultKhoa = await getEventsForTest(pool, userKhoa, "pending_faculty");
    console.log("KHOA pending_faculty events count:", resultKhoa.length);
    console.log("KHOA pending_faculty events:", JSON.stringify(resultKhoa, null, 2));

    // Giả lập role = CTSV (CB000000003)
    const userCtsv = { maND: "CB000000003", role: "CTSV" };
    console.log("\n--- Testing getEvents for CTSV (CB000000003) ---");
    const resultCtsv = await getEventsForTest(pool, userCtsv, "pending_student_affairs");
    console.log("CTSV pending_student_affairs events count:", resultCtsv.length);
    console.log("CTSV pending_student_affairs events:", JSON.stringify(resultCtsv, null, 2));

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit(0);
  }
}

async function getEventsForTest(pool, user, status) {
  const { maND: userId, role, clubId } = user;
  
  let query = `
    SELECT 
        MaSK, MaCLB, TenSK, MoTa, ThoiGianBatDau, ThoiGianKetThuc,
        DiaDiem, SoNguoiToiDa, ChiPhiDuKien, LoaiSK, DiemRenLuyen,
        TrangThai, LyDoTuChoi, NgayTao, KhoaDuyet, PhongCTSVDuyet
    FROM SU_KIEN
    WHERE 1=1
  `;

  let maDVQL = null;

  if (role === "BCN" && clubId) {
    query += ` AND MaCLB = @clubId`;
  } else if (role === "KHOA") {
    const dvqlResult = await pool.request().input("maND", sql.NVarChar(13), userId).query(`
      SELECT maDVQL FROM CANBO WHERE maCanBo = @maND AND trangThai = 1
    `);
    maDVQL = dvqlResult.recordset[0]?.maDVQL;
    if (maDVQL) {
      query += ` AND MaCLB IN (SELECT MaCLB FROM CAULACBO WHERE maDVQL = @maDVQL)`;
    } else {
      query += ` AND 1=0`;
    }
  } else if (role === "CTSV") {
    // CTSV: Được xem toàn bộ sự kiện của CLB
  }

  if (status) {
    query += ` AND TrangThai = @status`;
  }

  const request = pool.request();
  if (role === "BCN" && clubId) {
    request.input("clubId", sql.Char(13), clubId);
  }
  if (role === "KHOA" && maDVQL) {
    request.input("maDVQL", sql.NVarChar(50), maDVQL);
  }
  if (status) {
    request.input("status", sql.NVarChar(50), status);
  }

  const result = await request.query(query);
  return result.recordset;
}

testGetEventsForRoles();
