import { v2 as cloudinary } from "cloudinary";
import Report from "../mongoschema/reportSchema.js";
import Event from "../mongoschema/eventschema.js";
import mongoose from "mongoose";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const destroyImages = async (publicIds) => {
  const ids = (publicIds || []).filter(Boolean);
  if (ids.length === 0) return;
  const results = await Promise.allSettled(
    ids.map((publicId) => cloudinary.uploader.destroy(publicId))
  );
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Failed to delete image ${ids[i]}:`, r.reason?.message);
    }
  });
};

// ================= CREATE REPORT =================
export const createReport = async (req, res) => {
  try {
    const { eventId, title, description, images } = req.body;

    if (!isValidId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingReport = await Report.findOne({ event: eventId });
    if (existingReport) {
      return res
        .status(409)
        .json({ message: "Report already exists for this event" });
    }

    const report = await Report.create({
      event: eventId,
      title,
      description,
      images: images || [],
    });

    const populatedReport = await Report.findById(report._id).populate(
      "event",
      "title date"
    );

    res.status(201).json({
      message: "Report created successfully",
      report: populatedReport,
    });
  } catch (err) {
    console.error("createReport error:", err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET REPORT BY EVENT ID =================
export const getReportByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!isValidId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const report = await Report.findOne({ event: eventId }).populate(
      "event",
      "title date description"
    );

    if (!report) {
      return res
        .status(404)
        .json({ message: "Report not found for this event" });
    }

    res.status(200).json(report);
  } catch (err) {
    console.error("getReportByEventId error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE REPORT =================
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const updates = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (updates.images && report.images) {
      const oldImageIds = report.images.map((img) => img.publicId).filter(Boolean);
      const newImageIds = (updates.images || [])
        .map((img) => img.publicId)
        .filter(Boolean);

      const imagesToDelete = oldImageIds.filter(
        (pid) => !newImageIds.includes(pid)
      );
      await destroyImages(imagesToDelete);
    }

    // Allow clearing fields to empty strings
    if (updates.title !== undefined) report.title = updates.title;
    if (updates.description !== undefined) report.description = updates.description;
    if (updates.images !== undefined) report.images = updates.images;
    if (updates.isPublished !== undefined) report.isPublished = updates.isPublished;

    await report.save();

    const updatedReport = await Report.findById(report._id).populate(
      "event",
      "title date"
    );

    res.status(200).json({
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (err) {
    console.error("updateReport error:", err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE REPORT =================
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await destroyImages(report.images?.map((img) => img.publicId));
    await Report.findByIdAndDelete(id);

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("deleteReport error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET REPORT BY ID =================
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid report ID format" });
    }

    const report = await Report.findById(id).populate(
      "event",
      "title date description"
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Hide unpublished reports from anonymous callers
    if (!report.isPublished && req.user?.userrole !== "admin") {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (err) {
    console.error("getReportById error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL REPORTS =================
// Public callers only see published reports; admins may request all.
export const getAllReports = async (req, res) => {
  try {
    const isAdmin = req.user?.userrole === "admin";
    const includeUnpublished =
      isAdmin && (req.query.includeUnpublished === "true" || req.query.all === "true");

    const filter = includeUnpublished ? {} : { isPublished: true };

    const reports = await Report.find(filter)
      .populate("event", "title date")
      .sort({ publishedAt: -1 });

    res.status(200).json(reports);
  } catch (err) {
    console.error("getAllReports error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
