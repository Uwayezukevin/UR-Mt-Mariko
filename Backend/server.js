import express from "express";
import dotenv from "dotenv";
import connectDB from "./connection/conn.js";
import cors from "cors";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import router from "./routes/routes.js";
import messageRoutes from "./routes/messageRoute.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

connectDB();

// Routes
app.use("/umuryangoremezo/backend/", router);
app.use("/dashboard", dashboardRoutes);
app.use("/messages", messageRoutes);

// Socket
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

const port = process.env.PORT || 2350;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
