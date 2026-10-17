import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import Member from "../mongoschema/memberschema.js";
import mongoose from "mongoose";

const ACTIVE_THRESHOLD = Number(process.env.ATTENDANCE_THRESHOLD) || 30;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const memberAttendanceDecision = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid member ID format" });
    }

    const member = await Member.findById(memberId).select("createdAt fullName");
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const today = startOfDay(new Date());

    // Only count events that took place after the member joined, so new
    // members are not penalised for events they could not attend.
    const joinedAt = member.createdAt ? startOfDay(member.createdAt) : null;
    const eventFilter = { date: { $lte: today } };
    if (joinedAt && joinedAt <= today) {
      eventFilter.date = { $gte: joinedAt, $lte: today };
    }

    const pastEvents = await Event.find(eventFilter).select("_id");
    const totalEvents = pastEvents.length;

    if (totalEvents === 0) {
      return res.status(200).json({
        memberId,
        memberName: member.fullName,
        totalEvents: 0,
        attendedEvents: 0,
        attendancePercentage: 0,
        status: "NOT ACTIVE",
        message: "No events have occurred yet",
      });
    }

    const attendedEvents = await Attendance.countDocuments({
      member: member._id,
      status: "present",
      event: { $in: pastEvents.map((e) => e._id) },
    });

    const attendancePercentage = Math.round(
      (attendedEvents / totalEvents) * 100
    );
    const isActive = attendancePercentage >= ACTIVE_THRESHOLD;

    res.status(200).json({
      memberId,
      memberName: member.fullName,
      totalEvents,
      attendedEvents,
      attendancePercentage,
      status: isActive ? "ACTIVE" : "NOT ACTIVE",
      message: isActive
        ? "Member is active"
        : `Member attendance is below ${ACTIVE_THRESHOLD}%`,
    });
  } catch (err) {
    console.error("memberAttendanceDecision error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
