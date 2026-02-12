import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  useremail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  userphoneNumber: {
    type: String,
    required: true
  },

  userpassword: {
    type: String,
    required: true
  },

  userrole: {
    type: String,
    enum: ["admin", "editor"],
    default: "admin"
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
