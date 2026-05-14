const sql = require("mssql");
require('dotenv').config();

// Cấu hình kết nối SQL Server
const config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "QUANLYCLB_UTE",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "12345", // Giữ nguyên mật khẩu bạn đã sửa đúng
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000"), // Đưa timeout ra ngoài root
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || "1"),
    max: parseInt(process.env.DB_POOL_MAX || "10"),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
    // Đã xóa connectionTimeoutMillis ở trong này
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === "true" || false,
    trustServerCertificate: process.env.DB_TRUST_CERT === "true" || true,
    enableKeepAlive: true,
  },
};

let pool = null;

/**
 * Khởi tạo connection pool
 */
const initPool = async () => {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("✓ Database connection pool initialized successfully");

    // Event handlers
    pool.on("error", (err) => {
      console.error("❌ Database pool error:", err);
    });

    return pool;
  } catch (err) {
    console.error("❌ Failed to initialize database connection pool:", err);
    process.exit(1);
  }
};

/**
 * Đóng connection pool
 */
const closePool = async () => {
  if (pool) {
    await pool.close();
    console.log("✓ Database connection pool closed");
  }
};

/**
 * Trả về connection pool đã kết nối (lazy initialization).
 * Chỉ tạo pool mới nếu chưa có hoặc pool đã đóng.
 * @returns {Promise<sql.ConnectionPool>}
 */
async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    return pool;
  } catch (err) {
    pool = null;
    throw new Error(`Không thể kết nối database: ${err.message}`);
  }
}

/**
 * Khởi tạo kết nối database khi server khởi động.
 * Log kết quả thành công hoặc thất bại.
 */
async function connectDB() {
  try {
    await getPool();
    console.log(`[DB] Kết nối SQL Server thành công: ${process.env.DB_SERVER} / ${process.env.DB_NAME}`);
  } catch (err) {
    console.error(`[DB] Kết nối SQL Server thất bại: ${err.message}`);
    throw err;
  }
}

module.exports = {
  sql,
  initPool,
  getPool,
  closePool,
  connectDB
};
