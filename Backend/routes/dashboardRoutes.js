import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = express.Router();

// Get dashboard stats (admin only)
router.get("/stats", protect, adminOnly, getDashboardStats);

export default router;