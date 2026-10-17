import { checkSchema } from "express-validator";
import mongoose from "mongoose";

const membersArrayValidation = {
  optional: true,
  isArray: { errorMessage: "Members must be an array" },
  custom: {
    options: (value) => {
      if (!Array.isArray(value)) return true;
      for (const id of value) {
        if (id && !mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Every member must be a valid ID");
        }
      }
      return true;
    },
  },
};

export const eventSchema = checkSchema({
  title: {
    notEmpty: { errorMessage: "Izina ry'igikorwa rirakenewe" },
    isLength: {
      options: { min: 2, max: 150 },
      errorMessage: "Izina rigomba kugira inyuguti 2 kugeza kuri 150",
    },
    trim: true,
  },

  description: {
    notEmpty: { errorMessage: "Ubusobanuro bw'igikorwa burakenewe" },
    isLength: {
      options: { max: 5000 },
      errorMessage: "Ubusobanuro ntibugomba kurenga inyuguti 5000",
    },
  },

  date: {
    notEmpty: { errorMessage: "Itariki y'igikorwa irakenewe" },
    isISO8601: { errorMessage: "Itariki igomba kuba yanditse neza" },
    custom: {
      options: (value) => {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
          throw new Error("Itariki si iyukuri");
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsed < today) {
          throw new Error("Itariki y'igikorwa igomba kuba mu gihe kizaza");
        }
        return true;
      },
    },
  },

  members: membersArrayValidation,
});

// Partial update — every field optional, but validated when present
export const updateEventSchema = checkSchema({
  title: {
    optional: true,
    isLength: {
      options: { min: 2, max: 150 },
      errorMessage: "Izina rigomba kugira inyuguti 2 kugeza kuri 150",
    },
    trim: true,
  },

  description: {
    optional: true,
    isLength: {
      options: { max: 5000 },
      errorMessage: "Ubusobanuro ntibugomba kurenga inyuguti 5000",
    },
  },

  date: {
    optional: true,
    isISO8601: { errorMessage: "Itariki igomba kuba yanditse neza" },
  },

  members: membersArrayValidation,
});
