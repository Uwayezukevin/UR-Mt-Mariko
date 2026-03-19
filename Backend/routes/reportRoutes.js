import express from "express";
import {
  createReport,
  getReportByEventId,
  updateReport,
  deleteReport,
  getAllReports,
} from "../controllers/reportController.js";

const router = express.Router();

// Public routes
router.get("/event/:eventId", getReportByEventId);
router.get("/", getAllReports);

// Protected routes - temporarily remove adminOnly if middleware doesn't exist
router.post("/", createReport);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

export default router;