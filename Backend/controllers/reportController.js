import Report from "../mongoschema/reportSchema.js";
import Event from "../mongoschema/eventschema.js";
import cloudinary from 'cloudinary'; // Import cloudinary directly
import mongoose from "mongoose";

// Configure cloudinary (if not configured elsewhere)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= CREATE REPORT =================
export const createReport = async (req, res) => {
  try {
    const { eventId, title, description, images } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingReport = await Report.findOne({ event: eventId });
    if (existingReport) {
      return res.status(400).json({ message: "Report already exists for this event" });
    }

    const report = await Report.create({
      event: eventId,
      title,
      description,
      images: images || [], // ✅ now correct
    });

    const populatedReport = await Report.findById(report._id)
      .populate("event", "title date");

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
      .populate("event", "title date description");

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

    if (updates.images && report.images) {
      const oldImageIds = report.images.map(img => img.publicId).filter(id => id);
      const newImageIds = updates.images.map(img => img.publicId).filter(id => id);
      
      const imagesToDelete = oldImageIds.filter(id => !newImageIds.includes(id));
      
      for (const publicId of imagesToDelete) {
        try {
          await cloudinary.v2.uploader.destroy(publicId);
        } catch (err) {
          console.error(`Failed to delete image ${publicId}:`, err);
        }
      }
    }

    if (updates.title) report.title = updates.title;
    if (updates.description) report.description = updates.description;
    if (updates.images) report.images = updates.images;
    
    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate("event", "title date");

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

    if (report.images && report.images.length > 0) {
      for (const image of report.images) {
        if (image.publicId) {
          try {
            await cloudinary.v2.uploader.destroy(image.publicId);
          } catch (err) {
            console.error(`Failed to delete image ${image.publicId}:`, err);
          }
        }
      }
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
      .sort({ publishedAt: -1 });

    res.status(200).json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};