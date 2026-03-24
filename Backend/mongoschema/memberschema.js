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

// ================= SIMPLE PRE-VALIDATE HOOK =================
memberSchema.pre('validate', function(next) {
  // Only validate parent if category is not adult
  if (this.category !== "adult" && !this.parent) {
    this.invalidate('parent', `Parent is required for ${this.category}`);
  }
  next();
});

// ================= SIMPLE PRE-SAVE HOOK FOR ACCESSIBILITY =================
memberSchema.pre('save', function(next) {
  if (this.isModified('accessibility')) {
    this.accessibilityUpdatedAt = new Date();
  }
  next();
});

// ================= POST-SAVE HOOK FOR SPOUSE LINKING =================
memberSchema.post('save', async function(doc) {
  // Only run if spouse exists and it's a new spouse link
  if (doc.spouse && doc.isModified('spouse')) {
    try {
      const spouse = await mongoose.model("Member").findById(doc.spouse);
      if (spouse && (!spouse.spouse || spouse.spouse.toString() !== doc._id.toString())) {
        await mongoose.model("Member").findByIdAndUpdate(
          doc.spouse,
          { spouse: doc._id },
          { new: true }
        );
      }
    } catch (err) {
      console.error("Failed to update spouse link:", err);
    }
  }
});

// ================= ADD INDEXES =================
memberSchema.index({ fullName: 1 });
memberSchema.index({ category: 1 });
memberSchema.index({ subgroup: 1 });
memberSchema.index({ nationalId: 1 }, { unique: true, sparse: true });

// ================= ADD HELPER METHODS =================
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