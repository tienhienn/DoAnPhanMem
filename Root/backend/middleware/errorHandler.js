/**
 * Global error handler middleware cho Express.
 * Phải được đăng ký SAU tất cả routes.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  // Chỉ log chi tiết lỗi ở môi trường non-production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  } else {
    // Production: chỉ log message ngắn gọn, không lộ stack trace
    console.error('[ERROR]', err.message);
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Đã xảy ra lỗi, vui lòng thử lại sau',
    },
  });
}

module.exports = errorHandler;
