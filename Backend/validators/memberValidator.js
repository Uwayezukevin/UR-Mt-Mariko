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
        if (req.body.category === "child" && !value) {
          throw new Error("Child must have a parent");
        }
        if (req.body.category !== "child" && value) {
          throw new Error("Only children can have a parent");
        }
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
      options: (value) => {
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
});