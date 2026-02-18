import { checkSchema } from "express-validator";

export const userSchema = checkSchema({
  username: {
    notEmpty: { errorMessage: "Username is required" },
    isLength: {
      options: { min: 3 },
      errorMessage: "Username must be at least 3 characters",
    },
  },

  useremail: {
    notEmpty: { errorMessage: "Email is required" },
    isEmail: { errorMessage: "Must be a valid email address" },
  },

  userphonenumber: {
    notEmpty: { errorMessage: "Phone number is required" },
    matches: {
      options: [/^(\+2507|07)\d{8}$/],
      errorMessage: "Must be a valid Rwanda phone number",
    },
  },
  userpassword: {
    notEmpty: { errorMessage: "Password is required" },
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters",
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
