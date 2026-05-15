require("dotenv").config();
const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "QUANLYCLB_UTE",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "12345",
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000", 10),
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || "1", 10),
    max: parseInt(process.env.DB_POOL_MAX || "10", 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    enableKeepAlive: true,
  },
};

let pool = null;

/**
 * Khởi tạo connection pool và trả về object pool đã kết nối.
 */
const initPool = async () => {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();

    pool.on("error", (err) => {
      console.error("❌ Database pool error:", err);
    });

    console.log("✓ Database connection pool initialized successfully");
    return pool;
  } catch (err) {
    console.error("❌ Failed to initialize database connection pool:", err);
    process.exit(1);
  }
};

/**
 * Đóng connection pool.
 */
const closePool = async () => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("✓ Database connection pool closed");
  }
};

/**
 * Trả về kết nối pool đã khởi tạo, khởi tạo mới nếu cần.
 */
const getPool = async () => {
  if (pool && pool.connected) {
    return pool;
  }
  return initPool();
};

/**
 * Kết nối database khi server khởi động.
 */
const connectDB = getPool;

module.exports = {
  sql,
  initPool,
  getPool,
  closePool,
  connectDB,
};
