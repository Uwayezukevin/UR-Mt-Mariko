import mongoose from "mongoose"; // Added missing import
import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import Member from "../mongoschema/memberschema.js";

// =============================
// MARK ATTENDANCE
// =============================
export const markAttendance = async (req, res) => {
  try {
    const { eventId, memberId } = req.params;
    const { status, note } = req.body;

    // 1️⃣ Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 2️⃣ Compare only dates (not time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    // ==================================================
    // 🔥 AUTO MARK ABSENT IF EVENT ALREADY PASSED
    // ==================================================
    if (eventDate < today) {

      // Get all members
      const allMembers = await Member.find();

      for (const member of allMembers) {
        const existing = await Attendance.findOne({
          event: eventId,
          member: member._id,
        });

        if (!existing) {
          await Attendance.create({
            event: eventId,
            member: member._id,
            status: "absent",
            note: "Automatically marked absent (event closed)",
          });
        }
      }

      return res.status(400).json({
        message:
          "Event has already happened. All unmarked members are automatically marked as absent.",
      });
    }

    // 3️⃣ Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // 4️⃣ Check if attendance already exists
    let attendance = await Attendance.findOne({
      event: eventId,
      member: memberId,
    });

    if (attendance) {
      attendance.status = status || attendance.status;
      attendance.note = note || attendance.note;
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// GET ATTENDANCE BY EVENT
// =============================
export const getAttendanceByEvent = async (req, res) => {
  try {
    const attendanceList = await Attendance.find({
      event: req.params.eventId,
    })
      .populate({
        path: "member",
        select: "fullName category",
        populate: { path: "subgroup", select: "name" }
      })
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
    const attendanceList = await Attendance.find({
      member: req.params.memberId,
    })
      .populate({
        path: "member",
        select: "fullName category",
        populate: { path: "subgroup", select: "name" }
      })
      .populate("event", "title date");

    res.status(200).json(attendanceList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};