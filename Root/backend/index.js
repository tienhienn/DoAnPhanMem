require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initPool, closePool } = require("./db");
const { initDatabase } = require("./db/initDatabase");
const { errorHandler } = require("./middleware/auth");

// Import routes
const adminEventsRoutes = require("./routes/adminEvents");

const { connectDB } = require('./db/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/admin/events", adminEventsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
  });
});

// Global Error Handler
app.use(errorHandler);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/students', require('./routes/students'));

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

// Start Server
const startServer = async () => {
  try {
    // Khởi tạo database (tạo tables và insert dữ liệu mẫu)
    console.log("🔧 Initializing database...");
    await initDatabase();

    // Khởi tạo database connection pool
    await initPool();

    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n✓ Shutting down gracefully...");
  await closePool();
  process.exit(0);
});

startServer();
