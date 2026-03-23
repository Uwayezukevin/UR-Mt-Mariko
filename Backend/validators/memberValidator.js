import { checkSchema } from "express-validator";
import mongoose from "mongoose";
import Amasakramentu from "../mongoschema/sakramentsSchema.js";

// Helper function to get marriage sakrament ID
let marriageSakramentId = null;

const getMarriageSakramentId = async () => {
  if (marriageSakramentId) return marriageSakramentId;
  try {
    const marriage = await Amasakramentu.findOne({ name: "Ugushyingirwa" });
    marriageSakramentId = marriage?._id?.toString();
    return marriageSakramentId;
  } catch (err) {
    console.error("Could not find marriage sakrament:", err);
    return null;
  }
};

/* ================= CREATE MEMBER SCHEMA ================= */

export const createMember = async (req, res) => {
  try {
    console.log("🔍 ========== CREATE MEMBER START ==========");
    console.log("📦 Request body received:", JSON.stringify(req.body, null, 2));
    
    const {
      fullName,
      category,
      nationalId,
      dateOfBirth,
      phone,
      parent,
      gender,
      subgroup,
      sakraments,
      spouse,
      accessibility,
      accessibilityNotes,
      isActive,
    } = req.body;

    console.log("✅ Extracted fields:", {
      fullName,
      category,
      gender,
      subgroup,
      parent: parent || "null",
      spouse: spouse || "null",
      sakramentsCount: sakraments?.length || 0,
      accessibility
    });

    // Validate required fields
    if (!fullName) {
      console.log("❌ Missing fullName");
      return res.status(400).json({ message: "Full name is required" });
    }
    
    if (!category) {
      console.log("❌ Missing category");
      return res.status(400).json({ message: "Category is required" });
    }
    
    if (!gender) {
      console.log("❌ Missing gender");
      return res.status(400).json({ message: "Gender is required" });
    }
    
    if (!subgroup) {
      console.log("❌ Missing subgroup");
      return res.status(400).json({ message: "Subgroup is required" });
    }

    console.log("✅ Required fields validated");

    // Parent validation based on category
    if (category !== "adult") {
      console.log("🔍 Checking parent for non-adult category:", category);
      if (!parent || parent === "" || parent === "null" || parent === "undefined") {
        console.log("❌ Parent missing for non-adult");
        return res.status(400).json({
          message: `${category === "child" ? "Umwana" : "Urubyiruko"} agomba kugira umubyeyi`,
        });
      }
    }

    console.log("✅ Parent validation passed");

    // Spouse validation - only if marriage sakrament is selected
    console.log("🔍 Checking marriage sakrament...");
    let hasMarriage = false;
    let marriageId = null;
    
    try {
      // Safely get marriage sakrament ID
      const Amasakramentu = mongoose.model("Amasakramentu");
      const marriage = await Amasakramentu.findOne({ name: "Ugushyingirwa" });
      if (marriage) {
        marriageId = marriage._id;
        hasMarriage = sakraments?.some(sak => sak && sak.toString() === marriageId.toString());
        console.log("✅ Marriage sakrament found:", marriageId);
        console.log("🔍 Has marriage in selected sakraments:", hasMarriage);
      } else {
        console.log("⚠️ Marriage sakrament not found in database");
      }
    } catch (err) {
      console.error("❌ Error checking marriage sakrament:", err);
    }

    if (hasMarriage && (!spouse || spouse === "" || spouse === "null")) {
      console.log("❌ Marriage selected but no spouse provided");
      return res.status(400).json({
        message: "Ugomba gushyiraho uwo mwashyingiranywe",
      });
    }

    if (spouse && spouse === req.body._id) {
      console.log("❌ Self-marriage attempted");
      return res.status(400).json({
        message: "Ntushobora kwishyingira",
      });
    }

    console.log("✅ Spouse validation passed");

    // Accessibility validation
    const memberAccessibility = accessibility || "alive";
    const memberIsActive = isActive !== undefined ? isActive : 
                          (memberAccessibility === "alive" ? true : false);

    if (memberAccessibility !== "alive" && (!accessibilityNotes || accessibilityNotes === "")) {
      console.log("❌ Accessibility notes missing for non-alive status");
      return res.status(400).json({
        message: "Accessibility notes are required when status is not 'alive'",
      });
    }

    console.log("✅ Accessibility validation passed");

    // Prepare member data
    console.log("📝 Preparing member data...");
    const memberData = {
      fullName,
      category,
      gender,
      subgroup,
      accessibility: memberAccessibility,
      accessibilityUpdatedAt: new Date(),
      isActive: memberIsActive,
    };

    // Add optional fields
    if (nationalId && nationalId !== "") memberData.nationalId = nationalId;
    if (dateOfBirth && dateOfBirth !== "") memberData.dateOfBirth = dateOfBirth;
    if (phone && phone !== "") memberData.phone = phone;
    if (sakraments && sakraments.length > 0) memberData.sakraments = sakraments;
    if (accessibilityNotes && accessibilityNotes !== "") memberData.accessibilityNotes = accessibilityNotes;
    
    if (parent && parent !== "" && parent !== "null" && parent !== "undefined") {
      console.log("🔍 Adding parent:", parent);
      memberData.parent = parent;
    }
    
    if (spouse && spouse !== "" && spouse !== "null" && spouse !== "undefined") {
      console.log("🔍 Adding spouse:", spouse);
      memberData.spouse = spouse;
    }

    console.log("📦 Final member data to save:", JSON.stringify(memberData, null, 2));

    // Create member
    console.log("💾 Creating member in database...");
    const member = await Member.create(memberData);
    console.log("✅ Member created with ID:", member._id);
    
    // Update spouse's record if spouse exists
    if (spouse && spouse !== "" && spouse !== "null") {
      console.log("🔗 Updating spouse record:", spouse);
      await Member.findByIdAndUpdate(spouse, { spouse: member._id });
      console.log("✅ Spouse record updated");
    }

    // Populate and return
    console.log("📚 Populating member data...");
    const populatedMember = await Member.findById(member._id)
      .populate("parent", "fullName category")
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("spouse", "fullName category");

    console.log("✅ Member creation complete!");
    console.log("🔍 ========== CREATE MEMBER END ==========");

    res.status(201).json({
      message: "Member created successfully",
      member: populatedMember,
    });
    
  } catch (err) {
    console.error("❌ ========== CREATE MEMBER ERROR ==========");
    console.error("❌ Error name:", err.name);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    
    if (err.code === 11000 && err.keyPattern?.nationalId) {
      console.log("❌ Duplicate national ID detected");
      return res.status(400).json({ 
        message: "Indangamuntu isanzwe ikoreshwa" 
      });
    }
    
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};

/* ================= UPDATE MEMBER SCHEMA ================= */

export const updateMemberSchema = checkSchema({
  fullName: {
    optional: true,
    isLength: {
      options: { min: 2 },
      errorMessage: "Izina rigomba kuba rifite inyuguti zirenzwe ebyiri",
    },
  },

  category: {
    optional: true,
    isIn: {
      options: [["child", "youth", "adult"]],
      errorMessage: "Category must be child, youth, or adult",
    },
  },

  nationalId: {
    optional: { options: { nullable: true, checkFalsy: true } },
    isLength: {
      options: { min: 16, max: 16 },
      errorMessage: "Irangamuntu igomba kuba imibare 16",
    },
  },

  dateOfBirth: {
    optional: true,
    isISO8601: {
      errorMessage: "Shyiramo itariki ya nyayo",
    },
  },

  phone: {
    optional: { options: { checkFalsy: true } },
    matches: {
      options: [/^(\+2507|07)\d{8}$/],
      errorMessage: "Telefoni igomba kuba ari numero y'URwanda",
    },
  },

  parent: {
    optional: true,
    custom: {
      options: (value, { req }) => {
        const { category } = req.body;
        const currentCategory = req.member?.category;
        const effectiveCategory = category || currentCategory;
        
        if (effectiveCategory && effectiveCategory !== "adult") {
          if (value === null || value === undefined || value === "") {
            throw new Error(effectiveCategory === "child" 
              ? "Umwana agomba kugira umubyeyi" 
              : "Urubyiruko rugomba kugira umubyeyi");
          }
        }
        
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Parent must be a valid Member ID");
        }
        
        return true;
      },
    },
  },

  spouse: {
    optional: true,
    custom: {
      options: async (value, { req }) => {
        const { sakraments, _id } = req.body;
        
        const marriageId = await getMarriageSakramentId();
        const updatedSakraments = sakraments || req.member?.sakraments;
        const hasMarriage = marriageId && updatedSakraments?.includes(marriageId);
        
        if (hasMarriage && !value) {
          throw new Error("Ugomba gushyiraho uwo mwashyingiranywe");
        }
        
        if (value && value === _id) {
          throw new Error("Ntushobora kwishyingira");
        }
        
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Spouse must be a valid Member ID");
        }
        
        return true;
      },
    },
  },

  gender: {
    optional: true,
    isIn: {
      options: [["male", "female"]],
      errorMessage: "Gender must be male or female",
    },
  },

  subgroup: {
    optional: true,
    custom: {
      options: (value) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Subgroup must be a valid ID");
        }
        return true;
      },
    },
  },

  sakraments: {
    optional: true,
    isArray: {
      errorMessage: "Sakraments must be an array",
    },
    custom: {
      options: (value) => {
        if (!Array.isArray(value)) return true;
        for (let id of value) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("All sakraments must be valid IDs");
          }
        }
        return true;
      },
    },
  },

  accessibility: {
    optional: true,
    isIn: {
      options: [["alive", "dead", "moved"]],
      errorMessage: "Accessibility must be alive, dead, or moved",
    },
  },

  accessibilityNotes: {
    optional: { options: { checkFalsy: true } },
    isLength: {
      options: { max: 500 },
      errorMessage: "Accessibility notes cannot exceed 500 characters",
    },
    custom: {
      options: (value, { req }) => {
        const { accessibility } = req.body;
        if (accessibility && accessibility !== "alive" && !value) {
          throw new Error("Accessibility notes are required when status is not 'alive'");
        }
        return true;
      },
    },
  },

  isActive: {
    optional: true,
    isBoolean: {
      errorMessage: "isActive must be a boolean value",
    },
  },
});