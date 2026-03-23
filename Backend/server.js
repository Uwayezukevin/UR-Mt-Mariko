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
    ],
    methods: ["GET", "POST"],
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
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ===============================
// ROUTES
// ===============================
app.use("/umuryangoremezo/backend", router);
app.use("/umuryangoremezo/backend/dashboard", dashboardRoutes);
app.use("/umuryangoremezo/backend/messages", messageRoutes);
app.use("/umuryangoremezo/backend/reports", reportRoutes);
app.use("/umuryangoremezo/backend/api/upload", uploadRoutes);

// ===============================
// ERROR HANDLING MIDDLEWARE
// ===============================
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
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

    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
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

startServer();