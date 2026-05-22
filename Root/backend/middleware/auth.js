const jwt = require("jsonwebtoken");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7).trim();
};

const parseLegacyToken = (token) => {
  const decoded = Buffer.from(token, "base64").toString("utf-8");
  const [userId, role, clubId] = decoded.split(":");
  if (!userId || !role) {
    throw new Error("Invalid legacy token format");
  }
  return {
    maSV: userId,
    role,
    clubId: clubId === "null" ? null : clubId,
  };
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error("Missing authorization token");
  }

  if (token.includes(".")) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    return jwt.verify(token, secret);
  }

  return parseLegacyToken(token);
};

const auth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization token",
        data: null,
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    if (decoded.role === "SV") {
      try {
        const { getPool } = require("../db/index");
        const sql = require("mssql");
        const pool = await getPool();
        const result = await pool.request()
          .input("maND", sql.VarChar, decoded.maND)
          .query(`
            SELECT TOP 1 MaCLB 
            FROM THANH_VIEN 
            WHERE MaND = @maND 
              AND VaiTroCLB IN (N'Chủ nhiệm', N'Phó chủ nhiệm') 
              AND TrangThai = N'Hoạt động'
          `);
        
        if (result.recordset.length > 0) {
          req.user.role = "BCN";
          req.user.clubId = result.recordset[0].MaCLB;
        }
      } catch (dbErr) {
        console.error("Error checking BCN membership in auth middleware:", dbErr);
      }
    }

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      data: null,
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;

      if (decoded.role === "SV") {
        try {
          const { getPool } = require("../db/index");
          const sql = require("mssql");
          const pool = await getPool();
          const result = await pool.request()
            .input("maND", sql.VarChar, decoded.maND)
            .query(`
              SELECT TOP 1 MaCLB 
              FROM THANH_VIEN 
              WHERE MaND = @maND 
                AND VaiTroCLB IN (N'Chủ nhiệm', N'Phó chủ nhiệm') 
                AND TrangThai = N'Hoạt động'
            `);
          
          if (result.recordset.length > 0) {
            req.user.role = "BCN";
            req.user.clubId = result.recordset[0].MaCLB;
          }
        } catch (dbErr) {
          console.error("Error checking BCN membership in optionalAuth:", dbErr);
        }
      }
    }
  } catch (err) {
    // Nếu token không hợp lệ, không block request, chỉ không gán user
    req.user = null;
  }

  return next();
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        data: null,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        data: null,
      });
    }

    return next();
  };
};

module.exports = {
  auth,
  optionalAuth,
  verifyAuth: auth,
  authorizeRole,
};
