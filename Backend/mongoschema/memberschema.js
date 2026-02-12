import mongoose from "mongoose";
const memberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["child", "adult", "youth"],
      required: true,
    },
    nationalId: {
      type: String,
      unique: true,
      sparse: true,
    },
    dateOfBirth: Date,

    phone: String,

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    subgroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subgroups",
    },
    sakraments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Amasakramentu",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
export default mongoose.model("Member", memberSchema);
