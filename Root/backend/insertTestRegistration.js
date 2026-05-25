const { getPool } = require("./db");
const sql = require("mssql");

async function run() {
  try {
    const pool = await getPool();
    console.log("Database connected.");

    // Tạo MaDKMo dạng DKM + timestamp
    const maDKMo = "DKM_TEST_CNS";
    
    // Xóa record test cũ nếu có
    await pool.request()
      .input("maDKMo", sql.VarChar(13), maDKMo)
      .query("DELETE FROM DANGKY_MO_CLB WHERE MaDKMo = @maDKMo");

    const noiDungHoSo = {
      step1: { tinhCapThiet: "Cần thiết cho lập trình viên." },
      step2: { gioiThieu: "Giới thiệu CLB." },
      step3: { bcnLamThoi: [] },
      step4: { mucDichYeuCau: "Mục đích học tập." }
    };

    await pool.request()
      .input("maDKMo", sql.VarChar(13), maDKMo)
      .input("maND", sql.VarChar(13), "SV210000001")
      .input("maDVQL", sql.VarChar(13), "DVQL0000002") // Khoa CNS
      .input("tenCLB", sql.NVarChar(150), "CLB Lập Trình Thử Nghiệm")
      .input("linhVuc", sql.NVarChar(50), "Học thuật")
      .input("noiDungHoSo", sql.NVarChar(sql.MAX), JSON.stringify(noiDungHoSo))
      .query(`
        INSERT INTO DANGKY_MO_CLB (MaDKMo, MaND, MaDVQL, TenCLB, LinhVuc, NoiDungHoSo, TrangThai)
        VALUES (@maDKMo, @maND, @maDVQL, @tenCLB, @linhVuc, @noiDungHoSo, N'pending_faculty')
      `);

    console.log("Inserted test registration successfully.");
  } catch (err) {
    console.error("Failed to insert:", err);
  } finally {
    process.exit(0);
  }
}

run();
