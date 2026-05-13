const sql = require("mssql");

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
 * Lấy connection pool
 */
const getPool = () => {
  if (!pool) {
    throw new Error("Database pool not initialized. Call initPool() first.");
  }
  return pool;
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

module.exports = {
  sql,
  initPool,
  getPool,
  closePool,
};
