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
  getMemberWithFamily,
  getFamilyTree,      
  getMembersByFamily,
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
router.get("/members/search", protect, searchMembers);

// Get all members
router.get("/members", protect, getAllMembers);

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
router.get("/members/:id", protect, getMemberById);

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

router.get("/members/:id/family", protect, getMemberWithFamily);

// Get complete family tree starting from a root member
router.get("/members/:id/family-tree", protect, getFamilyTree);

// Get all members grouped by families
router.get("/families", protect, getMembersByFamily);

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
router.get("/events", protect, getAllEvents);

// Get event by ID
router.get("/events/:id", protect, getEventById);

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

router.get("/sakraments", protect, getAllSakraments);
router.get("/subgroups", protect, getAllSubgroups);

/* ==================== EXTRA MODULES ==================== */

router.use("/attendance", protect, attendanceRoutes);
router.use("/decision", protect, decisionRoutes);

export default router;