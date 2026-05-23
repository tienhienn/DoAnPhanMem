require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initPool, closePool } = require("./db");
const { initDatabase } = require("./db/initDatabase");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const adminEventsRoutes = require("./routes/adminEvents");
const eventRoutes = require("./routes/events");
const studentRoutes = require("./routes/students");
const clubRoutes = require("./routes/clubs");
const bcnEventsRoutes = require("./routes/bcnEvents");
const khoaEventsRoutes = require("./routes/khoaEvents");
const ctsvEventsRoutes = require("./routes/ctsvEvents");

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
app.use("/api/auth", authRoutes);
app.use("/api/admin/events", adminEventsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/bcn/events", bcnEventsRoutes);
app.use("/api/khoa/events", khoaEventsRoutes);
app.use("/api/ctsv/events", ctsvEventsRoutes);

// 404 handler — phải đặt sau tất cả routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint không tồn tại",
    },
  });
});

// Global error handler — phải đặt cuối cùng
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start Server
const startServer = async () => {
  try {
    console.log("🔧 Initializing database...");
    await initDatabase();
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
const shutdown = async () => {
  console.log("\n✓ Shutting down gracefully...");
  await closePool();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
