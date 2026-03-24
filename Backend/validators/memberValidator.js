import { checkSchema } from "express-validator";
import mongoose from "mongoose";

/* ================= CREATE MEMBER SCHEMA ================= */
export const createMemberSchema = checkSchema({
  fullName: {
    notEmpty: { errorMessage: "Izina ryuzuye rirakenewe" },
    isLength: {
      options: { min: 2 },
      errorMessage: "Izina rigomba kuba rifite inyuguti zirenga ebyiri",
    },
    trim: true,
  },

  category: {
    notEmpty: { errorMessage: "Icyiciro kirakenewe" },
    isIn: {
      options: [["child", "youth", "adult"]],
      errorMessage: "Category must be child, youth or adult",
    },
  },

  nationalId: {
    optional: { options: { nullable: true, checkFalsy: true } },
    isLength: {
      options: { min: 16, max: 16 },
      errorMessage: "Indangamuntu igomba kuba imibare 16",
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
      errorMessage: "Telefoni igomba kuba iy'u Rwanda",
    },
  },

  /* ================= PARENT ================= */
  parent: {
    optional: true,
    custom: {
      options: (value, { req }) => {
        const { category } = req.body;

        // Required for child & youth
        if (category !== "adult") {
          if (!value) {
            throw new Error(
              category === "child"
                ? "Umwana agomba kugira umubyeyi"
                : "Urubyiruko rugomba kugira umubyeyi"
            );
          }
        }

        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Parent must be valid ID");
        }

        return true;
      },
    },
  },

  /* ================= SPOUSE ================= */
  spouse: {
    optional: true,
    custom: {
      options: (value, { req }) => {
        const { sakraments, category } = req.body;

        // Only adults can marry
        if (category !== "adult") return true;

        // Check if marriage sakrament selected (by ID)
        const hasMarriage =
          Array.isArray(sakraments) && sakraments.length > 0;

        if (hasMarriage && !value) {
          throw new Error("Ugomba gushyiraho uwo mwashyingiranywe");
        }

        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Spouse must be valid ID");
        }

        return true;
      },
    },
  },

  gender: {
    notEmpty: { errorMessage: "Hitamo igitsina" },
    isIn: {
      options: [["male", "female"]],
      errorMessage: "Gender must be male or female",
    },
  },

  /* ================= SUBGROUP - FIXED: Made optional ================= */
  subgroup: {
    optional: true, // Changed from notEmpty to optional
    custom: {
      options: (value) => {
        // Only validate if value is provided
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Subgroup must be valid ID");
        }
        return true;
      },
    },
  },

  /* ================= SAKRAMENTS ================= */
  sakraments: {
    optional: true,
    isArray: {
      errorMessage: "Sakraments must be an array",
    },
    custom: {
      options: (value) => {
        if (!Array.isArray(value)) return true;

        for (let id of value) {
          if (id && !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid sakrament ID");
          }
        }
        return true;
      },
    },
  },

  /* ================= ACCESSIBILITY ================= */
  accessibility: {
    optional: true,
    isIn: {
      options: [["alive", "dead", "moved"]],
      errorMessage: "Accessibility must be alive, dead or moved",
    },
  },

  accessibilityNotes: {
    optional: true,
    isLength: {
      options: { max: 500 },
      errorMessage: "Notes ntizirenga inyuguti 500",
    },
    custom: {
      options: (value, { req }) => {
        const { accessibility } = req.body;

        if (accessibility && accessibility !== "alive" && !value) {
          throw new Error(
            "Ugomba gusobanura impamvu niba atari 'alive'"
          );
        }

        return true;
      },
    },
  },

  isActive: {
    optional: true,
    isBoolean: {
      errorMessage: "isActive must be true or false",
    },
  },
});

/* ================= UPDATE MEMBER SCHEMA ================= */
export const updateMemberSchema = checkSchema({
  fullName: {
    optional: true,
    isLength: {
      options: { min: 2 },
      errorMessage: "Izina rigomba kuba rifite inyuguti zirenga ebyiri",
    },
  },

  category: {
    optional: true,
    isIn: {
      options: [["child", "youth", "adult"]],
      errorMessage: "Invalid category",
    },
  },

  nationalId: {
    optional: true,
    isLength: {
      options: { min: 16, max: 16 },
      errorMessage: "Indangamuntu igomba kuba 16",
    },
  },

  phone: {
    optional: true,
    matches: {
      options: [/^(\+2507|07)\d{8}$/],
      errorMessage: "Telefoni siyo",
    },
  },

  parent: {
    optional: true,
    custom: {
      options: (value, { req }) => {
        const category = req.body.category || req.member?.category;

        if (category !== "adult" && !value) {
          throw new Error("Umubyeyi arakenewe");
        }

        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid parent ID");
        }

        return true;
      },
    },
  },

  spouse: {
    optional: true,
    custom: {
      options: (value) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid spouse ID");
        }
        return true;
      },
    },
  },

  subgroup: {
    optional: true,
    custom: {
      options: (value) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid subgroup ID");
        }
        return true;
      },
    },
  },

  sakraments: {
    optional: true,
    isArray: true,
  },

  accessibility: {
    optional: true,
    isIn: {
      options: [["alive", "dead", "moved"]],
    },
  },

  accessibilityNotes: {
    optional: true,
    custom: {
      options: (value, { req }) => {
        const accessibility = req.body.accessibility;

        if (accessibility && accessibility !== "alive" && !value) {
          throw new Error("Notes zirakenewe");
        }

        return true;
      },
    },
  },

  isActive: {
    optional: true,
    isBoolean: true,
  },
});