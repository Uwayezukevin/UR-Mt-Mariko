import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import Member from "../mongoschema/memberschema.js";

export const autoMarkAbsent = async () => {
  console.log("Running auto attendance job...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get events that already passed
  const pastEvents = await Event.find({
    date: { $lt: today },
  });

  for (const event of pastEvents) {
    const members = await Member.find({}, "_id");

    const existingAttendance = await Attendance.find(
      { event: event._id },
      "member"
    );

    const markedIds = existingAttendance.map((a) =>
      a.member.toString()
    );

    const absentList = members
      .filter((m) => !markedIds.includes(m._id.toString()))
      .map((m) => ({
        event: event._id,
        member: m._id,
        status: "absent",
        note: "Automatically marked absent (event closed)",
      }));

    if (absentList.length > 0) {
      await Attendance.insertMany(absentList);
    }
  }

  console.log("Auto attendance completed.");
};
