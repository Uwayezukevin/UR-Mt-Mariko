import mongoose from "mongoose";
import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import Member from "../mongoschema/memberschema.js";

const VALID_STATUSES = ["present", "absent"];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Mark every not-yet-recorded member absent for a closed event (bulk).
const closeAttendanceForEvent = async (eventId) => {
  const members = await Member.find({}, "_id");
  const existing = await Attendance.find({ event: eventId }, "member");
  const marked = new Set(existing.map((a) => a.member.toString()));

  const absentList = members
    .filter((m) => !marked.has(m._id.toString()))
    .map((m) => ({
      event: eventId,
      member: m._id,
      status: "absent",
      note: "Automatically marked absent (event closed)",
    }));

  if (absentList.length > 0) {
    await Attendance.insertMany(absentList, { ordered: false });
  }
  return absentList.length;
};

// =============================
// MARK ATTENDANCE
// =============================
export const markAttendance = async (req, res) => {
  try {
    const { eventId, memberId } = req.params;
    const { status, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid member ID format" });
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const member = await Member.findById(memberId).select("_id");
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const today = startOfDay(new Date());
    const eventDate = startOfDay(event.date);

    // If the event is in the past, close it: mark unmarked members absent
    // and refuse further manual marking.
    if (eventDate < today) {
      await closeAttendanceForEvent(eventId);
      return res.status(409).json({
        message:
          "Event has already happened. All unmarked members are automatically marked as absent.",
      });
    }

    let attendance = await Attendance.findOne({
      event: eventId,
      member: memberId,
    });

    if (attendance) {
      if (status !== undefined) attendance.status = status;
      if (note !== undefined) attendance.note = note;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        event: eventId,
        member: memberId,
        status: status || "present",
        note,
      });
    }

    res.status(200).json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (err) {
    console.error("markAttendance error:", err.message);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Attendance already recorded for this member" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET ATTENDANCE BY EVENT
// =============================
export const getAttendanceByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const attendanceList = await Attendance.find({ event: eventId })
      .populate({
        path: "member",
        select: "fullName category",
        populate: { path: "subgroup", select: "name" },
      })
      .populate("event", "title date");

    res.status(200).json(attendanceList);
  } catch (err) {
    console.error("getAttendanceByEvent error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ATTENDANCE BY MEMBER
export const getAttendanceByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid member ID format" });
    }

    const attendanceList = await Attendance.find({ member: memberId })
      .populate({
        path: "member",
        select: "fullName category",
        populate: { path: "subgroup", select: "name" },
      })
      .populate("event", "title date")
      .sort({ createdAt: -1 });

    res.status(200).json(attendanceList);
  } catch (err) {
    console.error("getAttendanceByMember error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
