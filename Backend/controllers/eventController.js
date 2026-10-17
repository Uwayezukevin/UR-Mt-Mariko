import Event from "../mongoschema/eventschema.js";
import mongoose from "mongoose";

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, members } = req.body;

    const event = await Event.create({
      title: title.trim(),
      description,
      date,
      members: members || [],
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    console.error("createEvent error:", err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: "members",
        select: "fullName category gender",
        populate: [
          { path: "subgroup", select: "name" },
          { path: "sakraments", select: "name" },
        ],
      })
      .sort({ date: -1 });
    res.status(200).json(events);
  } catch (err) {
    console.error("getAllEvents error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(req.params.id).populate({
      path: "members",
      select: "-nationalId",
      populate: [
        { path: "subgroup", select: "name" },
        { path: "sakraments", select: "name" },
        { path: "parent", select: "fullName category" },
        { path: "spouse", select: "fullName category" },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("getEventById error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (startOfDay(event.date) < startOfDay(new Date())) {
      return res
        .status(409)
        .json({ message: "Cannot update an event that has already happened" });
    }

    const { title, description, date, members } = req.body;

    // Whitelist updatable fields (no mass assignment)
    if (title !== undefined) event.title = title.trim();
    if (description !== undefined) event.description = description;
    if (date !== undefined) {
      if (startOfDay(date) < startOfDay(new Date())) {
        return res.status(400).json({ message: "Event date must be in the future" });
      }
      event.date = date;
    }
    if (members !== undefined) event.members = members;

    await event.save();

    res.status(200).json({ message: "Event updated", event });
  } catch (err) {
    console.error("updateEvent error:", err.message);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (startOfDay(event.date) < startOfDay(new Date())) {
      return res
        .status(409)
        .json({ message: "Cannot delete an event that has already happened" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("deleteEvent error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
