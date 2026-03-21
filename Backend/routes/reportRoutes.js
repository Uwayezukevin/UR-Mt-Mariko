import express from "express";
import {
  createReport,
  getReportByEventId,
  updateReport,
  deleteReport,
  getAllReports,
} from "../controllers/reportController.js";

const router = express.Router();

// Public
router.get("/", getAllReports);
router.get("/event/:eventId", getReportByEventId);

// Protected
router.post("/", createReport);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

export default router;