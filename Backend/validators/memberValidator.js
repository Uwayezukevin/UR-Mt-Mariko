import { checkSchema } from "express-validator";
import mongoose from "mongoose";

/* ================= CREATE MEMBER SCHEMA ================= */

export const createMemberSchema = checkSchema({
  fullName: {
    notEmpty: { errorMessage: "Izina ryuzuye rirakenewe" },
    isLength: {
      options: { min: 2 },
      errorMessage:
        "Izina ryuzuye rigomba kuba rifite inyuguti zirenzwe ebyiri",
    },
  },

  category: {
    notEmpty: { errorMessage: "Icyiciro kirakenwe" },
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
        
        // For child and youth, parent is required
        if (category !== "adult" && !value) {
          throw new Error(category === "child" 
            ? "Umwana agomba kugira umubyeyi" 
            : "Urubyiruko rugomba kugira umubyeyi");
        }
        
        // Validate ObjectId if parent is provided
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Parent must be a valid Member ID");
        }
        
        return true;
      },
    },
  },

  gender: {
    notEmpty: { errorMessage: "Select gender" },
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

  // Accessibility fields
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

/* ================= UPDATE MEMBER SCHEMA ================= */

export const updateMemberSchema = checkSchema({
  fullName: {
    optional: true,
    isLength: {
      options: { min: 2 },
      errorMessage:
        "Izina rigomba kuba rifite inyuguti zirenzwe ebyiri",
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
        const currentCategory = req.member?.category; // You'd need to pass current member data
        
        // Determine which category to use for validation
        const effectiveCategory = category || currentCategory;
        
        // For child and youth, parent is required if category is being updated or if parent is being changed
        if (effectiveCategory && effectiveCategory !== "adult") {
          // If parent is explicitly set to null/empty, that's an error
          if (value === null || value === undefined || value === "") {
            throw new Error(effectiveCategory === "child" 
              ? "Umwana agomba kugira umubyeyi" 
              : "Urubyiruko rugomba kugira umubyeyi");
          }
        }
        
        // Validate ObjectId if parent is provided
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Parent must be a valid Member ID");
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

  // Accessibility fields
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

// Optional: Schema for bulk operations if needed
export const bulkMemberSchema = checkSchema({
  members: {
    isArray: {
      errorMessage: "Members must be an array",
    },
    custom: {
      options: (value) => {
        if (!Array.isArray(value)) return true;
        
        for (let member of value) {
          // Validate each member has required fields
          if (!member.fullName) {
            throw new Error("Each member must have a fullName");
          }
          if (!member.category || !["child", "youth", "adult"].includes(member.category)) {
            throw new Error("Each member must have a valid category");
          }
          if (!member.gender || !["male", "female"].includes(member.gender)) {
            throw new Error("Each member must have a valid gender");
          }
          
          // Parent validation for each member
          if (member.category !== "adult" && !member.parent) {
            throw new Error(member.category === "child" 
              ? "Umwana wese agomba kugira umubyeyi" 
              : "Urubyiruko rwose rugomba kugira umubyeyi");
          }
        }
        
        return true;
      },
    },
  },
});