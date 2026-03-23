import express from "express";
import validate from "../middlewares/validate.js";
import { protect, adminOnly } from "../middlewares/auth.js";

// Validators
import { userSchema } from "../validators/userValidator.js";
import {
  createMemberSchema,
  updateMemberSchema,
} from "../validators/memberValidator.js";
import { eventSchema } from "../validators/eventValidator.js";

// User Controllers
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/userController.js";

// Member Controllers
import {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  searchMembers,
} from "../controllers/memberController.js";

// Event Controllers
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

// Other Controllers
import { getAllSakraments } from "../controllers/sakramentsController.js";
import { getAllSubgroups } from "../controllers/subgroupsController.js";

// Other Routes
import attendanceRoutes from "./attendanceRoutes.js";
import decisionRoutes from "./decisionRoutes.js";

const router = express.Router();

/* ==================== USER ROUTES ==================== */

router.post("/users/register", userSchema, validate, registerUser);
router.post("/users/login", loginUser);
router.post("/users/logout", logoutUser);

/* ==================== MEMBER ROUTES ==================== */

// 🔥 SEARCH MUST COME BEFORE :id - CORRECT ORDER
router.get("/members/search", searchMembers);

// Get all members
router.get("/members", getAllMembers);

// Create member
router.post(
  "/members",
  protect,
  adminOnly,
  createMemberSchema,
  validate,
  createMember
);

// Get member by ID - This must come AFTER specific routes like /search
router.get("/members/:id", getMemberById);

// Update member
router.put(
  "/members/:id",
  protect,
  adminOnly,
  updateMemberSchema,
  validate,
  updateMember
);

// Delete member
router.delete("/members/:id", protect, adminOnly, deleteMember);

/* ==================== EVENT ROUTES ==================== */

// Create event
router.post(
  "/events", 
  protect, 
  adminOnly, 
  eventSchema, 
  validate, 
  createEvent
);

// Get all events
router.get("/events", getAllEvents);

// Get event by ID
router.get("/events/:id", getEventById);

// Update event
router.put(
  "/events/:id",
  protect,
  adminOnly,
  eventSchema,
  validate,
  updateEvent
);

// Delete event
router.delete("/events/:id", protect, adminOnly, deleteEvent);

/* ==================== SACRAMENTS & SUBGROUPS ==================== */

router.get("/sakraments", getAllSakraments);
router.get("/subgroups", getAllSubgroups);

/* ==================== EXTRA MODULES ==================== */

router.use("/attendance", attendanceRoutes);
router.use("/decision", decisionRoutes);

export default router;