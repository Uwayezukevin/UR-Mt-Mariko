import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Izina ryuzuye rirakenewe"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["child", "adult", "youth"],
      required: [true, "Icyiciro kirakenewe"],
    },
    nationalId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    spouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Igitsina kirakenewe"],
    },
    subgroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subgroups",
      default: null,
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
    },
    accessibilityUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    accessibilityNotes: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

// ================= NO CUSTOM HOOKS - ALL VALIDATION IN CONTROLLER =================
// All pre-save, pre-validate, and post-save hooks have been removed
// All validation is handled in the controller

// ================= ADD INDEXES =================
memberSchema.index({ fullName: 1 });
memberSchema.index({ category: 1 });
memberSchema.index({ subgroup: 1 });
memberSchema.index({ nationalId: 1 }, { unique: true, sparse: true });

// ================= ADD HELPER METHODS (these are safe - no hooks) =================
memberSchema.methods.getAccessibilityInKinyarwanda = function() {
  const translations = {
    alive: "Ariho",
    dead: "Yarapfuye",
    moved: "Yimukiye ahandi",
  };
  return translations[this.accessibility] || this.accessibility;
};

memberSchema.methods.canParticipate = function() {
  return this.accessibility === "alive" && this.isActive === true;
};

memberSchema.methods.getParentInfo = function() {
  if (!this.parent) {
    return this.category === "adult" 
      ? { message: "Nta mubyeyi (umukuru ashobora kudafite umubyeyi)" }
      : { message: "Nta mubyeyi wabonetse" };
  }
  return this.parent;
};

memberSchema.methods.getSpouseInfo = async function() {
  if (!this.spouse) return null;
  const spouse = await mongoose.model("Member").findById(this.spouse);
  return spouse;
};

memberSchema.methods.isMarried = function() {
  return !!this.spouse;
};

memberSchema.methods.getMarriageStatus = function() {
  if (this.spouse) return "Yashyingiye";
  return "Ntashyingiye";
};

// ================= PREVENT OVERWRITE MODEL ERROR =================
const Member = mongoose.models.Member || mongoose.model("Member", memberSchema);

export default Member;