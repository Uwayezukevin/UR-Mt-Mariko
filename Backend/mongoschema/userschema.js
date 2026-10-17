import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },
    useremail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    userphonenumber: {
      type: String,
      required: true,
      trim: true,
    },

    userpassword: {
      type: String,
      required: true,
      minlength: 6,
    },

    userrole: {
      type: String,
      enum: ["admin", "editor"],
      default: "editor",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
