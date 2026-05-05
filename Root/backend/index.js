require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./db/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
// TODO: app.use('/api/events', require('./routes/events'));
// TODO: app.use('/api/students', require('./routes/students'));

// 404 handler — phải đặt sau tất cả routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint không tồn tại',
    },
  });
});

// Global error handler — phải đặt cuối cùng
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Chỉ khởi động server sau khi kết nối DB thành công
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Server] Không thể khởi động do lỗi kết nối DB:', err.message);
    process.exit(1);
  });
