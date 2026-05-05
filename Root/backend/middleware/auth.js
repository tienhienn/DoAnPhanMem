const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT bắt buộc.
 * Đọc header Authorization: Bearer {token}, verify và gắn req.user.
 */
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Vui lòng đăng nhập để tiếp tục',
      },
    });
  }

  const token = authHeader.slice(7); // bỏ "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      maSV: decoded.maSV,
      hoTen: decoded.hoTen,
      email: decoded.email,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token không hợp lệ',
      },
    });
  }
}

/**
 * Middleware xác thực JWT tùy chọn.
 * Nếu có token hợp lệ thì gắn req.user, nếu không có token thì vẫn gọi next().
 * Dùng cho các endpoint public nhưng cần biết thêm thông tin khi đã đăng nhập.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      maSV: decoded.maSV,
      hoTen: decoded.hoTen,
      email: decoded.email,
    };
  } catch (err) {
    // Token lỗi trong optionalAuth → bỏ qua, không gắn req.user
  }

  next();
}

module.exports = { auth, optionalAuth };
