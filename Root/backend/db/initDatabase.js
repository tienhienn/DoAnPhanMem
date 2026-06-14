const sql = require("mssql");
const fs = require("fs");
const path = require("path");

/**
 * Khởi tạo database từ file SQL
 * Chạy trước khi khởi động server
 */
const initDatabase = async () => {
  const config = {
    server: process.env.DB_SERVER || "localhost",
      port: parseInt(process.env.DB_PORT || "1433", 10),
    database: "master", // Kết nối đến master để tạo database
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "12345",
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000"),
    options: {
      encrypt: process.env.DB_ENCRYPT === "true" || false,
      trustServerCertificate: process.env.DB_TRUST_CERT === "true" || true,
      enableKeepAlive: true,
    },
  };

  let connection = null;

  try {
    console.log("📦 Connecting to SQL Server...");
    connection = new sql.ConnectionPool(config);
    await connection.connect();
    console.log("✓ Connected to SQL Server");

    // Đọc file SQL
    const sqlFilePath = path.join(__dirname, "../../QuanLyCLB.sql");
    if (!fs.existsSync(sqlFilePath)) {
      console.warn("⚠️  QuanLyCLB.sql not found at:", sqlFilePath);
      console.log("📝 Skipping database initialization");
      return;
    }

    const sqlScript = fs.readFileSync(sqlFilePath, "utf-8");

    // Chia script thành các batch (GO là delimiter trong SQL Server)
    const batches = sqlScript
      .split(/\r?\nGO\r?\n/i)
      .map((batch) => batch.trim())
      .filter((batch) => batch.length > 0);

    console.log(`📋 Found ${batches.length} SQL batches to execute`);

    // Chạy từng batch
    for (let i = 0; i < batches.length; i++) {
      try {
        const batch = batches[i];
        console.log(`⏳ Executing batch ${i + 1}/${batches.length}...`);
        await connection.request().query(batch);
      } catch (err) {
        // Bỏ qua lỗi nếu database/table đã tồn tại
        if (
          err.message.includes("already exists") ||
          err.message.includes("ALREADY_EXISTS")
        ) {
          console.log(`⚠️  Batch ${i + 1} skipped (already exists)`);
        } else {
          console.error(`❌ Error in batch ${i + 1}:`, err.message);
          // Tiếp tục với batch tiếp theo thay vì dừng
        }
      }
    }

    console.log("✓ Database initialization completed successfully");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.close();
      console.log("✓ Connection closed");
    }
  }
};

module.exports = { initDatabase };
