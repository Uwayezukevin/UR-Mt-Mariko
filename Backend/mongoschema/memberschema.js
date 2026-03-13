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
    // New accessibility field
    accessibility: {
      type: String,
      enum: ["alive", "dead", "moved"],
      default: "alive",
      required: true,
    },
    // Optional: Add date fields for tracking changes
    accessibilityUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    accessibilityNotes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Optional: Add a pre-save hook to update accessibilityUpdatedAt
memberSchema.pre('save', function(next) {
  if (this.isModified('accessibility')) {
    this.accessibilityUpdatedAt = new Date();
  }
  next();
});

// Optional: Add a method to get accessibility status in Kinyarwanda
memberSchema.methods.getAccessibilityInKinyarwanda = function() {
  const translations = {
    alive: "Ariho",
    dead: "Yarapfuye",
    moved: "Yimukiye ahandi",
  };
  return translations[this.accessibility] || this.accessibility;
};

// Optional: Add a method to check if member can participate in events
memberSchema.methods.canParticipate = function() {
  return this.accessibility === "alive" && this.isActive === true;
};

export default mongoose.model("Member", memberSchema);