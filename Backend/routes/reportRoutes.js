import express from "express";
import { protect, adminOnly } from "../middlewares/auth.js";
import {
  createReport,
  getReportByEventId,
  updateReport,
  deleteReport,
  getAllReports,
} from "../controllers/reportController.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllReports);
router.get("/event/:eventId", getReportByEventId);

// Protected routes (admin only)
router.post("/", protect, adminOnly, createReport);
router.put("/:id", protect, adminOnly, updateReport);
router.delete("/:id", protect, adminOnly, deleteReport);

export default router;