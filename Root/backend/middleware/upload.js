// File: middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục uploads tồn tại (sử dụng absolute path)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✓ Thư mục uploads được tạo tại:", uploadDir);
}

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Lưu vào thư mục uploads
  },
  filename: function (req, file, cb) {
    // Đổi tên file để không bị trùng (Thêm timestamp vào trước tên gốc)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - chỉ cho phép các file có type phù hợp
const fileFilter = (req, file, cb) => {
  // Các loại file được phép
  const allowedTypes =
    /pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|jpg|jpeg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Loại file không được phép. Vui lòng tải lên file: PDF, Word, Excel, PowerPoint, ZIP, hoặc hình ảnh",
      ),
    );
  }
};

// Khởi tạo middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn file tối đa 10MB
  fileFilter: fileFilter,
});

module.exports = upload;
