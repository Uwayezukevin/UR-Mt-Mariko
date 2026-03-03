import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
    note: String,
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Attendance =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);

export default Attendance;