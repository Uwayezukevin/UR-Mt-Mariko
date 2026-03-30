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
      unique: true,  // This already creates an index - DO NOT add another one
      sparse: true,
    },
    dateOfBirth: Date,
    phone: String,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      validate: {
        validator: function(value) {
          if (this.category === "adult") {
            return true;
          }
          return value != null;
        },
        message: props => `Parent is required for ${props.doc?.category || 'this category'}`
      }
    },
    spouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
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
    accessibility: {
      type: String,
      enum: ["alive", "dead", "moved"],
      default: "alive",
      required: true,
    },
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

// ✅ Pre-save validation for parent field
memberSchema.pre('validate', function(next) {
  if (this.category !== "adult" && !this.parent) {
    this.invalidate('parent', `Parent is required for ${this.category}`);
  }
  next();
});

// ✅ Pre-save hook to update accessibilityUpdatedAt
memberSchema.pre('save', function(next) {
  if (this.isModified('accessibility')) {
    this.accessibilityUpdatedAt = new Date();
  }
  next();
});

// ✅ Method to get accessibility status in Kinyarwanda
memberSchema.methods.getAccessibilityInKinyarwanda = function() {
  const translations = {
    alive: "Ariho",
    dead: "Yarapfuye",
    moved: "Yimukiye ahandi",
  };
  return translations[this.accessibility] || this.accessibility;
};

// ✅ Method to check if member can participate in events
memberSchema.methods.canParticipate = function() {
  return this.accessibility === "alive" && this.isActive === true;
};

// ✅ Method to get parent info
memberSchema.methods.getParentInfo = function() {
  if (!this.parent) {
    return this.category === "adult" 
      ? { message: "Nta mubyeyi (umukuru ashobora kudafite umubyeyi)" }
      : { message: "Nta mubyeyi wabonetse" };
  }
  return this.parent;
};

// ✅ Method to get spouse info
memberSchema.methods.getSpouseInfo = async function() {
  if (!this.spouse) return null;
  const spouse = await mongoose.model("Member").findById(this.spouse);
  return spouse;
};

// ✅ Method to check if member is married
memberSchema.methods.isMarried = function() {
  return !!this.spouse;
};

// ✅ Method to get marriage status in Kinyarwanda
memberSchema.methods.getMarriageStatus = function() {
  if (this.spouse) return "Yashyingiye";
  return "Ntashyingiye";
};

// ✅ DO NOT add this line - it would create a duplicate index
// memberSchema.index({ nationalId: 1 });

// ✅ If you need indexes for other fields, add them here
memberSchema.index({ fullName: 1 });
memberSchema.index({ category: 1 });
memberSchema.index({ subgroup: 1 });

export default mongoose.model("Member", memberSchema);