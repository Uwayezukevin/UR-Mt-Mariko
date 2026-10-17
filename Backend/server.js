import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import mongoose from "mongoose";

import connectDB from "./connection/conn.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import router from "./routes/routes.js";
import messageRoutes from "./routes/messageRoute.js";
import reportRoutes from "./routes/reportRoutes.js";
import uploadRoutes from "./routes/uploadRoute.js";
import { autoMarkAbsent } from "./utils/autoAttendance.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 2350;

// ===============================
// CORS ORIGINS (single source of truth)
// ===============================
const DEFAULT_ORIGINS = [
  "https://umuryangoremezo-mutagatifu-mariko.vercel.app",
  "http://localhost:2300",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

const allowedOrigins = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (no origin) and any allow-listed origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ===============================
// SOCKET.IO SETUP (same origins)
// ===============================
const io = new Server(server, { cors: corsOptions });

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===============================
// SECURITY & CORE MIDDLEWARE
// ===============================
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Trust proxy so rate-limit and secure cookies work behind Render/Vercel
app.set("trust proxy", 1);

// Global rate limiter (protects the whole API from abuse)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down." },
});
app.use("/umuryangoremezo/backend", globalLimiter);
app.use("/messages", globalLimiter);

// Stricter limiter for authentication endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});
app.use("/umuryangoremezo/backend/users/login", authLimiter);
app.use("/umuryangoremezo/backend/users/register", authLimiter);

// Lightweight request logging (skip noisy health checks)
app.use((req, res, next) => {
  if (req.path === "/health") return next();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ===============================
// TEST & HEALTH ROUTES
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "API is running...",
    version: "1.1.0",
    endpoints: {
      members: "/umuryangoremezo/backend/members",
      events: "/umuryangoremezo/backend/events",
      attendance: "/umuryangoremezo/backend/attendance",
    },
  });
});

app.get("/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = states[mongoose.connection.readyState] || "unknown";
  const healthy = mongoose.connection.readyState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    database: dbState,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ===============================
// ROUTES
// ===============================
app.use("/umuryangoremezo/backend", router);
app.use("/umuryangoremezo/backend/dashboard", dashboardRoutes);
app.use("/messages", messageRoutes);
app.use("/umuryangoremezo/backend/reports", reportRoutes);
app.use("/umuryangoremezo/backend/api/upload", uploadRoutes);

// ===============================
// 404 HANDLER (before error handler)
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

// ===============================
// ERROR HANDLING MIDDLEWARE
// ===============================
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed" });
  }

  const isMulterError = err.name === "MulterError";
  if (isMulterError) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ===============================
// SOCKET CONNECTION
// ===============================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ===============================
// SERVER START
// ===============================
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌍 Allowed origins: ${allowedOrigins.join(", ")}`);
    });

    // Run auto-attendance once on boot (non-blocking failure)
    try {
      await autoMarkAbsent();
      console.log("✅ Initial auto attendance completed");
    } catch (err) {
      console.error("❌ Initial auto attendance failed:", err.message);
    }

    // Schedule daily job at midnight
    cron.schedule("0 0 * * *", async () => {
      console.log("⏰ Running daily auto attendance...");
      try {
        await autoMarkAbsent();
        console.log("✅ Daily auto attendance completed");
      } catch (error) {
        console.error("❌ Auto attendance failed:", error.message);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// ===============================
// GRACEFUL SHUTDOWN
// ===============================
let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);

  io.close();
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err.message);
    }
    process.exit(0);
  });

  // Force exit if it takes too long
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

startServer();
