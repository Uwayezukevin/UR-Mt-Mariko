import express from "express";
import validate from "../middlewares/validate.js";
import { protect, adminOnly } from "../middlewares/auth.js";

// Import Validators
import { userSchema } from "../validators/userValidator.js";
import { memberSchema } from "../validators/memberValidator.js";
import { eventSchema } from "../validators/eventValidator.js";

// Import Controllers
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/userController.js";

// Other imports

import { getAllSakraments } from "../controllers/sakramentsController.js";
import { getAllSubgroups } from "../controllers/subgroupsController.js";

import {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";

import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import attendanceRoutes from "./attendanceRoutes.js";
import decisionRoutes from "./decisionRoutes.js"
const router = express.Router();

/* ==================== USER ROUTES ==================== */
// Register new user
router.post("/users/register", userSchema, validate, registerUser);

// Login
router.post("/users/login", loginUser);

// Logout
router.post("/users/logout", logoutUser);

/* ==================== MEMBER ROUTES ==================== */
// Create member
router.post(
  "/members",
  protect,
  adminOnly,
  memberSchema,
  validate,
  createMember,
);

// Get all members
router.get("/members", getAllMembers);

// Get member by ID
router.get("/members/:id", getMemberById);

// Update member
router.put(
  "/members/:id",
  protect,
  adminOnly,
  memberSchema,
  validate,
  updateMember,
);

// Delete member
router.delete("/members/:id", protect, adminOnly, deleteMember);

/* ==================== EVENT ROUTES ==================== */
// Create event
router.post("/events", protect, adminOnly, eventSchema, validate, createEvent);

// Get all events
router.get("/events", protect, getAllEvents);

// Get event by ID
router.get("/events/:id", protect, getEventById);

// Update event (only future events)
router.put(
  "/events/:id",
  protect,
  adminOnly,
  eventSchema,
  validate,
  updateEvent,
);

// Delete event (only future events)
router.delete("/events/:id", protect, adminOnly, deleteEvent);

/* ==================== SACRAMENTS & SUBGROUPS ROUTES ==================== */
// Get all sakraments (for forms)
router.get("/sakraments", getAllSakraments);

// Get all subgroups (for forms)
router.get("/subgroups", getAllSubgroups);


router.use("/attendance", attendanceRoutes);
router.use("/decision" , decisionRoutes);
export default router;
