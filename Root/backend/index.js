require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
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
const taskRoutes = require("./routes/tasks");
const memberRoutes = require("./routes/members");
const khoaClubsRouter = require("./routes/khoaClubs");

const financeLogisticsRoutes = require("./routes/financeLogistics");
const khoaDashboardRouter = require("./routes/khoaDashboard");

const app = express();

// Middleware logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
    );
  });
  next();
});

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
app.use("/api/ctsv/clubs", require("./routes/ctsvClubs"));
app.use("/api/tasks", taskRoutes);
app.use("/api/bcn/members", memberRoutes);
app.use("/api/khoa/clubs", khoaClubsRouter);
app.use("/api/bcn/reports", require("./routes/reports"));
app.use("/api/bcn/finance-logistics", financeLogisticsRoutes);
app.use("/api/ctsv/reports", require("./routes/ctsvReports"));
app.use("/api/khoa/dashboard", khoaDashboardRouter);

// Cấp quyền truy cập công khai vào thư mục uploads (sử dụng absolute path)
const uploadDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadDir));

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
    let dbReady = false;

    if (process.env.SKIP_DB_INIT === "true") {
      console.log(
        "⚠️  SKIP_DB_INIT is true — skipping database initialization",
      );
      try {
        await initPool();
        dbReady = true;
      } catch (dbErr) {
        console.warn(
          "⚠️  Database connection pool initialization failed:",
          dbErr.message || dbErr,
        );
      }
    } else {
      try {
        console.log("🔧 Initializing database...");
        await initDatabase();
        await initPool();
        dbReady = true;
        console.log("✓ Database initialized — proceeding to start server");
      } catch (dbErr) {
        console.warn(
          "⚠️  Database initialization failed — starting server anyway:",
          dbErr.message || dbErr,
        );
      }
    }

    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      if (!dbReady) {
        console.log(
          "⚠️  Warning: Database not connected. Some endpoints may be unavailable.",
        );
      }
    });
  } catch (err) {
    console.error("❌ Unexpected error while starting server:", err);
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
