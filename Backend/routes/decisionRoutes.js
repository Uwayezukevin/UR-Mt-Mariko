import express from "express";
import { protect, adminOnly } from "../middlewares/auth.js";
import { memberAttendanceDecision } from "../controllers/decisionController.js";

const router = express.Router();

// Check if a member is active
router.get(
  "/member/:memberId",
  protect,
  adminOnly,
  memberAttendanceDecision
);

export default router;
