import express from "express";
import {
  createReport,
  getReportByEventId,
  updateReport,
  deleteReport,
  getAllReports,
} from "../controllers/reportController.js";
import { adminOnly } from "../middlewares/auth.js"; // If you have auth middleware

const router = express.Router();

// Public routes
router.get("/event/:eventId", getReportByEventId);
router.get("/", getAllReports);

// Protected routes (require authentication)
router.post("/", adminOnly, createReport);
router.put("/:id", adminOnly, updateReport);
router.delete("/:id", adminOnly, deleteReport);

export default router;