import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import Member from "../mongoschema/memberschema.js";

// MARK ATTENDANCE
export const markAttendance = async (req, res) => {
  try {
    const {eventId, memberId,} = req.params;
    const {status, note } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Check if attendance already exists
    let attendance = await Attendance.findOne({ event: eventId, member: memberId });
    if (attendance) {
      // Update existing attendance
      attendance.status = status || attendance.status;
      attendance.note = note || attendance.note;
      await attendance.save();
    } else {
      // Create new attendance
      attendance = await Attendance.create({
        event: eventId,
        member: memberId,
        status: status || "present",
        note,
      });
    }

    res.status(200).json({ message: "Attendance marked", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ATTENDANCE BY EVENT
export const getAttendanceByEvent = async (req, res) => {
  try {
    const attendanceList = await Attendance.find({ event: req.params.eventId })
      .populate("member", "fullName category")
      .populate("event", "title date");

    res.status(200).json(attendanceList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ATTENDANCE BY MEMBER
export const getAttendanceByMember = async (req, res) => {
  try {
    const attendanceList = await Attendance.find({ member: req.params.memberId })
      .populate("member", "fullName category")
      .populate("event", "title date");

    res.status(200).json(attendanceList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
