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

dotenv.config();

const app = express();
const server = http.createServer(app);

// ===============================
// SOCKET.IO SETUP
// ===============================
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// DATABASE CONNECTION
// ===============================
connectDB();

// ===============================
// ROUTES
// ===============================
app.use("/umuryangoremezo/backend/", router);
app.use("/dashboard", dashboardRoutes);
app.use("/messages", messageRoutes);

// ===============================
// SOCKET CONNECTION
// ===============================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

// ===============================
// 🔥 CRON JOB - AUTO MARK ABSENT
// ===============================
// Runs every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily auto attendance job...");
  try {
    await autoMarkAbsent();
  } catch (error) {
    console.error("Auto attendance failed:", error);
  }
});

// Optional: run once when server starts (for testing)
(async () => {
  try {
    await autoMarkAbsent();
    console.log("Initial auto attendance check completed.");
  } catch (err) {
    console.error("Initial auto attendance failed:", err);
  }
})();

// ===============================
// SERVER START
// ===============================
const port = process.env.PORT || 2350;

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
