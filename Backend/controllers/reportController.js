import Report from "../mongoschema/reportSchema.js";
import Event from "../mongoschema/eventschema.js";
import mongoose from "mongoose";

// ================= CREATE REPORT =================
export const createReport = async (req, res) => {
  try {
    const { eventId, title, description, images, summary, highlights, statistics } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if report already exists for this event
    const existingReport = await Report.findOne({ event: eventId });
    if (existingReport) {
      return res.status(400).json({ message: "Report already exists for this event" });
    }

    const report = await Report.create({
      event: eventId,
      title,
      description,
      images: images || [],
      summary: summary || "",
      highlights: highlights || [],
      statistics: statistics || {},
      createdBy: req.user?.userId, // If you have user authentication
    });

    const populatedReport = await Report.findById(report._id)
      .populate("event", "title date")
      .populate("createdBy", "username email");

    res.status(201).json({
      message: "Report created successfully",
      report: populatedReport,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET REPORT BY EVENT ID =================
export const getReportByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    const report = await Report.findOne({ event: eventId })
      .populate("event", "title date description")
      .populate("createdBy", "username");

    if (!report) {
      return res.status(404).json({ message: "Report not found for this event" });
    }

    res.status(200).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE REPORT =================
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update fields
    if (updates.title) report.title = updates.title;
    if (updates.description) report.description = updates.description;
    if (updates.images) report.images = updates.images;
    if (updates.summary) report.summary = updates.summary;
    if (updates.highlights) report.highlights = updates.highlights;
    if (updates.statistics) report.statistics = updates.statistics;
    if (updates.isPublished !== undefined) report.isPublished = updates.isPublished;

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate("event", "title date")
      .populate("createdBy", "username");

    res.status(200).json({
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE REPORT =================
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL REPORTS =================
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ isPublished: true })
      .populate("event", "title date")
      .populate("createdBy", "username")
      .sort({ publishedAt: -1 });

    res.status(200).json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};