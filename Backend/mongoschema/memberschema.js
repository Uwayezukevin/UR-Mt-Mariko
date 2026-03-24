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
      default: null, // Make it optional
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

// Pre-save validation for parent field
memberSchema.pre('validate', function(next) {
  // Only validate parent if category is not adult AND parent is required
  if (this.category !== "adult" && !this.parent) {
    this.invalidate('parent', `Parent is required for ${this.category}`);
  }
  next();
});

// Pre-save validation for spouse field - FIXED to avoid async issues
memberSchema.pre('save', async function(next) {
  if (!this.isModified('spouse') || !this.spouse) return next();
  
  try {
    const Amasakramentu = mongoose.model("Amasakramentu");
    const marriageSak = await Amasakramentu.findOne({ 
      name: { $regex: /Ugushyingirwa/i } 
    });
    
    if (marriageSak) {
      const hasMarriageSakrament = this.sakraments?.some(
        sak => sak && sak.toString() === marriageSak._id.toString()
      );
      
      if (!hasMarriageSakrament && this.spouse) {
        this.invalidate('spouse', "Ugomba guhitamo isakramentu ry 'ugushyingirwa mbere yo gushyiraho uwo mwashyingiranywe");
      }
    }
  } catch (err) {
    console.error("Error in spouse validation:", err);
  }
  
  next();
});

// Post-save hook to update spouse's record
memberSchema.post('save', async function(doc) {
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

// Pre-save hook to update accessibilityUpdatedAt
memberSchema.pre('save', function(next) {
  if (this.isModified('accessibility')) {
    this.accessibilityUpdatedAt = new Date();
  }
  next();
});

// Add indexes for better performance
memberSchema.index({ fullName: 1 });
memberSchema.index({ category: 1 });
memberSchema.index({ subgroup: 1 });
memberSchema.index({ nationalId: 1 }, { unique: true, sparse: true });

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

// Add a method to get spouse info
memberSchema.methods.getSpouseInfo = async function() {
  if (!this.spouse) return null;
  const spouse = await mongoose.model("Member").findById(this.spouse);
  return spouse;
};

// Add a method to check if member is married
memberSchema.methods.isMarried = function() {
  return !!this.spouse;
};

// Add a method to get marriage status in Kinyarwanda
memberSchema.methods.getMarriageStatus = function() {
  if (this.spouse) return "Yashyingiye";
  return "Ntashyingiye";
};

// Prevent OverwriteModelError
const Member = mongoose.models.Member || mongoose.model("Member", memberSchema);

export default Member;