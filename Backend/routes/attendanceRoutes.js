import express from "express";
import { protect, adminOnly } from "../middlewares/auth.js";
import {
  markAttendance,
  getAttendanceByEvent,
  getAttendanceByMember,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark/:eventId/:memberId", protect, adminOnly, markAttendance);
router.get("/event/:eventId", protect, getAttendanceByEvent);
// Attendance history is internal — requires authentication.
router.get("/member/:memberId", protect, getAttendanceByMember);

export default router;
