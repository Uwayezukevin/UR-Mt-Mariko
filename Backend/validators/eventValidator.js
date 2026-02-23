import { checkSchema } from "express-validator";

export const eventSchema = checkSchema({
  title: {
    notEmpty: { errorMessage: "Izina ry'igikorwa rirakenewe" },
    isLength: {
      options: { min: 2 },
      errorMessage: "Izina rigomba kugira byibura inyuguti ebyiri",
    },
  },

  description: {
    notEmpty: { errorMessage: "Ubusobanuro bw'igikorwa burakenewe" },
  },

  date: {
    notEmpty: { errorMessage: "Itariki y'igikorwa irakenewe" },
    isISO8601: { errorMessage: "Itariki igomba kuba yanditse neza" },
  },

  members: {
    optional: true,
    isArray: { errorMessage: "Members must be an array" },
  },
});
