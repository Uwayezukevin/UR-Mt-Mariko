import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import mongoose from "mongoose";

export const memberAttendanceDecision = async (req, res) => {
  try {
    const { memberId } = req.params;
    const today = new Date();

    // Count past events
    const pastEvents = await Event.find({ date: { $lte: today } }).select('_id');
    const totalEvents = pastEvents.length;

    if (totalEvents === 0) {
      return res.status(200).json({
        memberId,
        attendancePercentage: 0,
        status: "NOT ACTIVE",
        message: "No events have occurred yet",
      });
    }

    // Count attended events only for past events
    const attendedEvents = await Attendance.countDocuments({
      member: new mongoose.Types.ObjectId(memberId),
      status: "present",
      event: { $in: pastEvents.map(e => e._id) }
    });

    const attendancePercentage = Math.round((attendedEvents / totalEvents) * 100);
    const isActive = attendancePercentage >= 30;

    res.status(200).json({
      memberId,
      totalEvents,
      attendedEvents,
      attendancePercentage,
      status: isActive ? "ACTIVE" : "NOT ACTIVE",
      message: isActive ? "Member is active" : "Member attendance is below 30%",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
