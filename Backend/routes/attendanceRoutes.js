import express from "express";
import { protect, adminOnly } from "../middlewares/auth.js";
import {
  markAttendance,
  getAttendanceByEvent,
  getAttendanceByMember,
} from "../controllers/attendanceController.js";

const router = express.Router();

// Mark attendance (admin only)
router.post(
  "/mark/:eventId/:memberId",
  protect,
  adminOnly,
  markAttendance
);


// Get all attendance for a specific event
router.get("/event/:eventId", protect, getAttendanceByEvent);

// Get all attendance for a specific member
router.get("/member/:memberId", getAttendanceByMember);

export default router;
