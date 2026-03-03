import express from "express";
import { memberAttendanceDecision } from "../controllers/decisionController.js";

const router = express.Router();

// Check if a member is active
router.get(
  "/member/:memberId",
  memberAttendanceDecision
);

export default router;
