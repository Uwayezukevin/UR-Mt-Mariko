import express from "express";
import { protect, adminOnly, optionalAuth } from "../middlewares/auth.js";
import {
  createReport,
  getReportById,
  getReportByEventId,
  updateReport,
  deleteReport,
  getAllReports,
} from "../controllers/reportController.js";

const router = express.Router();

// Public routes (optionalAuth lets admins see unpublished content)
router.get("/", optionalAuth, getAllReports);
router.get("/event/:eventId", getReportByEventId);
router.get("/:id", optionalAuth, getReportById);

// Protected routes (admin only)
router.post("/", protect, adminOnly, createReport);
router.put("/:id", protect, adminOnly, updateReport);
router.delete("/:id", protect, adminOnly, deleteReport);

export default router;
