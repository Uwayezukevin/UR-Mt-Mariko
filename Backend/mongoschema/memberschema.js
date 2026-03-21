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
    spouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
      validate: {
        validator: async function(value) {
          if (!value) return true;
          
          // Prevent self-marriage
          if (value.toString() === this._id?.toString()) {
            return false;
          }
          
          // Ensure spouse exists
          const spouse = await mongoose.model("Member").findById(value);
          if (!spouse) return false;
          
          // Ensure opposite gender
          if (spouse.gender === this.gender) {
            return false;
          }
          
          return true;
        },
        message: props => {
          if (props.value?.toString() === props.doc?._id?.toString()) {
            return "Ntushobora kwishyingira";
          }
          return "Uwo mwashyingiranywe ntabaho cyangwa igitsina kirimo kibihuje";
        }
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

// Pre-save validation for spouse field (additional check)
memberSchema.pre('save', async function(next) {
  // Skip if spouse hasn't changed
  if (!this.isModified('spouse')) return next();
  
  // If spouse is being set
  if (this.spouse) {
    // Check if marriage sakrament is selected
    const Amasakramentu = mongoose.model("Amasakramentu");
    const marriageSak = await Amasakramentu.findOne({ name: "Ugushyingirwa" });
    
    const hasMarriageSakrament = this.sakraments?.some(
      sak => sak.toString() === marriageSak?._id?.toString()
    );
    
    if (!hasMarriageSakrament) {
      this.invalidate('spouse', "Ugomba guhitamo isakramentu ry 'ugushyingirwa mbere yo gushyiraho uwo mwashyingiranywe");
    }
  }
  
  next();
});

// Post-save hook to update spouse's record
memberSchema.post('save', async function(doc) {
  // If spouse is set, update the spouse's record to link back
  if (doc.spouse && doc.isModified('spouse')) {
    try {
      await mongoose.model("Member").findByIdAndUpdate(
        doc.spouse,
        { spouse: doc._id },
        { new: true }
      );
    } catch (err) {
      console.error("Failed to update spouse link:", err);
    }
  }
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

export default mongoose.model("Member", memberSchema);