import { checkSchema } from "express-validator";
import mongoose from "mongoose";
import Amasakramentu from "../mongoschema/sakramentsSchema.js"; // Adjust path as needed

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

export const createMemberSchema = checkSchema({
  fullName: {
    notEmpty: { errorMessage: "Izina ryuzuye rirakenewe" },
    isLength: {
      options: { min: 2 },
      errorMessage: "Izina ryuzuye rigomba kuba rifite inyuguti zirenzwe ebyiri",
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
        
        if (category !== "adult" && !value) {
          throw new Error(category === "child" 
            ? "Umwana agomba kugira umubyeyi" 
            : "Urubyiruko rugomba kugira umubyeyi");
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
        
        // Get actual marriage sakrament ID
        const marriageId = await getMarriageSakramentId();
        
        // Check if marriage sakrament is selected
        const hasMarriage = sakraments?.includes(marriageId);
        
        if (hasMarriage && !value) {
          throw new Error("Ugomba gushyiraho uwo mwashyingiranywe");
        }
        
        // Prevent self-marriage
        if (value && value === _id) {
          throw new Error("Ntushobora kwishyingira");
        }
        
        // Validate ObjectId
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Spouse must be a valid Member ID");
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
        
        // Get actual marriage sakrament ID
        const marriageId = await getMarriageSakramentId();
        
        // Check if marriage sakrament is selected
        const updatedSakraments = sakraments || req.member?.sakraments;
        const hasMarriage = updatedSakraments?.includes(marriageId);
        
        if (hasMarriage && !value) {
          throw new Error("Ugomba gushyiraho uwo mwashyingiranywe");
        }
        
        // Prevent self-marriage
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