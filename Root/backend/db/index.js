require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
  server: process.env.DB_SERVER, // e.g. 'DESKTOP-A45O3KR\\CONGKIET'
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,               // tắt TLS cho môi trường local
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

/** @type {sql.ConnectionPool | null} */
let pool = null;

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

module.exports = { getPool, connectDB };
