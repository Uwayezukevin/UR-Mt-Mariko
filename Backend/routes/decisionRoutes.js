import express from "express";
import { protect } from "../middlewares/auth.js";
import { memberAttendanceDecision } from "../controllers/decisionController.js";

const router = express.Router();

// Attendance standing is internal data — requires authentication.
router.get("/member/:memberId", protect, memberAttendanceDecision);

export default router;
