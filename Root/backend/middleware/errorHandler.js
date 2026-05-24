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
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", err);
  } else {
    // Production: chỉ log message ngắn gọn, không lộ stack trace
    console.error("[ERROR]", err.message);
  }

  // Xử lý lỗi multer (file upload)
  if (err.code === "LIMIT_PART_COUNT") {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: "Quá nhiều phần trong request",
      },
    });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: "Kích thước file vượt quá giới hạn 10MB",
      },
    });
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: "Quá nhiều file",
      },
    });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: "File không được phép",
      },
    });
  }
  if (err.message && err.message.includes("Loại file không được phép")) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: err.message,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Đã xảy ra lỗi, vui lòng thử lại sau",
    },
  });
}

module.exports = errorHandler;
