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
      // Parent is optional for adults, required for children and youth
      validate: {
        validator: function(value) {
          // If category is adult, parent is optional
          if (this.category === "adult") {
            return true; // Parent can be null or a value
          }
          // For child and youth, parent is required
          return value != null;
        },
        message: props => `Parent is required for ${props.doc?.category || 'this category'}`
      }
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

// Pre-save validation for parent field
memberSchema.pre('validate', function(next) {
  // Additional validation logic can be added here if needed
  if (this.category !== "adult" && !this.parent) {
    this.invalidate('parent', `Parent is required for ${this.category}`);
  }
  next();
});

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

// Add a method to get parent info with proper validation
memberSchema.methods.getParentInfo = function() {
  if (!this.parent) {
    return this.category === "adult" 
      ? { message: "Nta mubyeyi (umukuru ashobora kudafite umubyeyi)" }
      : { message: "Nta mubyeyi wabonetse" };
  }
  return this.parent;
};

export default mongoose.model("Member", memberSchema);