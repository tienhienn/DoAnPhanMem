/**
 * Utility để sinh ID tự động với định dạng CHAR(13)
 * Định dạng: SKyypppXXXX
 * - SK: Prefix (Sự Kiện)
 * - yy: Năm (2 chữ số)
 * - ppp: Phòng/Khoa (3 chữ số)
 * - XXXX: Số thứ tự (4 chữ số)
 */

/**
 * Sinh ID cho Sự Kiện
 * @param {number} year - Năm (VD: 2026)
 * @param {number} deptCode - Mã phòng/khoa (0-999)
 * @param {number} sequence - Số thứ tự (0-9999)
 * @returns {string} ID theo định dạng SKyypppXXXX
 */
const generateEventId = (
  year = new Date().getFullYear(),
  deptCode = 0,
  sequence = 1,
) => {
  const yy = String(year % 100).padStart(2, "0");
  const ppp = String(deptCode).padStart(3, "0");
  const xxxx = String(sequence).padStart(4, "0");
  return `SK${yy}${ppp}${xxxx}`;
};

/**
 * Sinh ID theo sequence tự động từ database
 * @param {object} pool - Connection pool từ mssql
 * @returns {string} ID mới theo định dạng SKyypppXXXX
 */
const generateEventIdAuto = async (pool) => {
  const { sql } = require("../db");

  try {
    const year = new Date().getFullYear();
    const yy = String(year % 100).padStart(2, "0");
    const ppp = "000"; // Mặc định phòng 0

    // Lấy số thứ tự tiếp theo từ database
    const query = `
            SELECT ISNULL(MAX(CAST(SUBSTRING(MaSK, 8, 4) AS INT)), 0) + 1 AS nextSeq
            FROM SU_KIEN
            WHERE MaSK LIKE 'SK${yy}${ppp}%'
        `;

    const result = await pool.request().query(query);
    const nextSeq = result.recordset[0]?.nextSeq || 1;
    const xxxx = String(nextSeq).padStart(4, "0");

    return `SK${yy}${ppp}${xxxx}`;
  } catch (err) {
    console.error("❌ Error generating event ID:", err);
    throw err;
  }
};

/**
 * Parse ID để lấy thông tin
 * @param {string} id - ID theo định dạng SKyypppXXXX
 * @returns {object} {prefix, year, dept, sequence}
 */
const parseEventId = (id) => {
  if (!id || id.length !== 13) {
    throw new Error("Invalid ID format");
  }

  return {
    prefix: id.substring(0, 2), // SK
    year: 2000 + parseInt(id.substring(2, 4)), // yy
    dept: parseInt(id.substring(4, 7)), // ppp
    sequence: parseInt(id.substring(9, 13)), // xxxx
  };
};

module.exports = {
  generateEventId,
  generateEventIdAuto,
  parseEventId,
};
