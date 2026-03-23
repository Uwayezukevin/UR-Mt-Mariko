import express from "express";
import { memberAttendanceDecision } from "../controllers/decisionController.js";

const router = express.Router();

// Check if a member is active
router.get("/member/:memberId", async (req, res, next) => {
  try {
    await memberAttendanceDecision(req, res);
  } catch (error) {
    console.error("Decision route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;