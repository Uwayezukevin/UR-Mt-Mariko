import { checkSchema } from "express-validator";
import mongoose from "mongoose";

export const memberSchema = checkSchema({
  fullName: {
    notEmpty: { errorMessage: "Full name is required" },
    isLength: {
      options: { min: 2 },
      errorMessage: "Full name must be at least 2 characters",
    },
  },

  category: {
    notEmpty: { errorMessage: "Category is required" },
    isIn: {
      options: [["child", "youth", "adult"]],
      errorMessage: "Category must be child, youth, or adult",
    },
  },

  nationalId: {
    optional: true,
    isLength: {
      options: { min: 16, max: 16 },
      errorMessage: "National ID must be 16 characters",
    },
  },

  dateOfBirth: {
    optional: true,
    isISO8601: {
      errorMessage: "Date of birth must be a valid date",
    },
  },

  phone: {
    optional: true,
    matches: {
      options: [/^(\+2507|07)\d{8}$/],
      errorMessage: "Must be a valid Rwanda phone number",
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
  gender : {
    notEmpty : {errorMessage : "You must have a gender select your gender"},
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
