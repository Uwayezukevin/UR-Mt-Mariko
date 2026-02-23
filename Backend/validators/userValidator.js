import { checkSchema } from "express-validator";

export const userSchema = checkSchema({
  username: {
    notEmpty: { errorMessage: "Izina ryawe rirakenewe" },
    isLength: {
      options: { min: 3 },
      errorMessage: "Izina rigomba kuba byibura inyuguti zirenze 3",
    },
  },

  useremail: {
    notEmpty: { errorMessage: "Email yawe irakenewe" },
    isEmail: { errorMessage: "Shyiramo email ya nyayo" },
  },

  userphonenumber: {
    notEmpty: { errorMessage: "Numero ya telefoni irakenewe" },
    matches: {
      options: [/^(\+2507|07)\d{8}$/],
      errorMessage: "Numero ya telefoni igomba kuba ari iy'u Rwanda",
    },
  },
  userpassword: {
    notEmpty: { errorMessage: "Ijambo banga rirakenewe" },
    isLength: {
      options: { min: 6 },
      errorMessage: "Ijambo banga rigomba kuba byibura guhera kunyuguti 6 kuzamura",
    },
  },

  userrole: {
    optional: true,
    isIn: {
      options: [["admin", "editor"]],
      errorMessage: "Role must be admin or editor",
    },
  },
});
