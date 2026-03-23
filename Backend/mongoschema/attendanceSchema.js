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

// ✅ Add compound index to prevent duplicate attendance records
// This ensures a member can only have one attendance record per event
attendanceSchema.index({ event: 1, member: 1 }, { unique: true });

// ✅ Add index for faster queries
attendanceSchema.index({ member: 1 });
attendanceSchema.index({ event: 1 });

// ✅ Prevent OverwriteModelError
const Attendance =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);

export default Attendance;