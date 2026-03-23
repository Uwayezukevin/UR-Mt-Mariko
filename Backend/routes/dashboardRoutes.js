import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = express.Router();

// Get dashboard stats (admin only)
router.get("/stats", protect, adminOnly, async (req, res, next) => {
  try {
    await getDashboardStats(req, res);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;