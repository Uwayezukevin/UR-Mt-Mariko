import { checkSchema } from "express-validator";

export const eventSchema = checkSchema({
  title: {
    notEmpty: { errorMessage: "Event title is required" },
    isLength: {
      options: { min: 2 },
      errorMessage: "Title must be at least 2 characters",
    },
  },

  description: {
    notEmpty: { errorMessage: "Event description is required" },
  },

  date: {
    notEmpty: { errorMessage: "Event date is required" },
    isISO8601: { errorMessage: "Event date must be a valid ISO date" },
  },

  members: {
    optional: true,
    isArray: { errorMessage: "Members must be an array" },
  },
});
