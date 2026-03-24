import express from "express";
import dotenv from "dotenv";
import connectDB from "./connection/conn.js";
import cors from "cors";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import router from "./routes/routes.js";
import messageRoutes from "./routes/messageRoute.js";
import { Server } from "socket.io";
import http from "http";
import cron from "node-cron";
import { autoMarkAbsent } from "./utils/autoAttendance.js";
import reportRoutes from "./routes/reportRoutes.js";
import uploadRoutes from "./routes/uploadRoute.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ===============================
// SOCKET.IO SETUP
// ===============================
const io = new Server(server, {
  cors: {
    origin: [
      "https://umuryangoremezo-mutagatifu-mariko.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===============================
// MIDDLEWARE
// ===============================
app.use(
  cors({
    origin: [
      "https://umuryangoremezo-mutagatifu-mariko.vercel.app",
      "http://localhost:2300",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running...",
    version: "1.0.0",
    endpoints: {
      members: "/umuryangoremezo/backend/members",
      events: "/umuryangoremezo/backend/events",
      attendance: "/umuryangoremezo/backend/attendance"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
// ERROR HANDLING MIDDLEWARE
// ===============================
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  console.error("Stack trace:", err.stack);
  
  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({ 
      message: "Validation error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === "CastError") {
    return res.status(400).json({ 
      message: "Invalid ID format" 
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ 
      message: `Duplicate value for ${field}` 
    });
  }
  
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.url
  });
});

// ===============================
// SOCKET CONNECTION
// ===============================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ===============================
// SERVER START
// ===============================
const port = process.env.PORT || 2350;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");
    
    // Test database connection by listing collections
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📚 Available collections: ${collections.map(c => c.name).join(", ")}`);
    }
    
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Run immediately once
    try {
      await autoMarkAbsent();
      console.log("✅ Initial auto attendance completed");
    } catch (err) {
      console.error("❌ Initial auto attendance failed:", err);
    }

    // Schedule daily job at midnight
    cron.schedule("0 0 * * *", async () => {
      console.log("⏰ Running daily auto attendance...");
      try {
        await autoMarkAbsent();
        console.log("✅ Daily auto attendance completed");
      } catch (error) {
        console.error("❌ Auto attendance failed:", error);
      }
    });

  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  console.error("Stack trace:", err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
  process.exit(1);
});

startServer();