/**
 * Middleware xác thực người dùng từ header Authorization
 * Giải mã JWT (hoặc custom token) và attach user info vào req
 */

const verifyAuth = (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization token",
        data: null,
      });
    }

    // Loại bỏ "Bearer " prefix
    const token = authHeader.substring(7);

    // Giả lập decode token (trong thực tế sử dụng jwt.verify)
    // Format token mẫu: base64(userId:role:clubId)
    let decodedUser;
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const [userId, role, clubId] = decoded.split(":");

      if (!userId || !role) {
        throw new Error("Invalid token format");
      }

      decodedUser = {
        userId,
        role,
        clubId: clubId || null,
      };
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or malformed token",
        data: null,
      });
    }

    // Attach user info vào request object
    req.user = decodedUser;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      data: null,
    });
  }
};

/**
 * Middleware kiểm tra quyền: Chỉ cho phép các role cụ thể
 * @param {string[]} allowedRoles - Mảng các role được phép
 */
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

    next();
  };
};

/**
 * Middleware xử lý lỗi toàn cục
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = {
  verifyAuth,
  authorizeRole,
  errorHandler,
};
