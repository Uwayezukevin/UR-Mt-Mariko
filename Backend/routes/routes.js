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
  searchMembers, // ✅ ADD THIS
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

// 🔥 SEARCH MUST COME BEFORE :id
router.get("/members/search", searchMembers);

// Create member
// Create
router.post(
  "/members",
  createMemberSchema,
  validate,
  createMember
);

// Update
router.put(
  "/members/:id",
  protect,
  adminOnly,
  updateMemberSchema,
  validate,
  updateMember
);

// Get all members
router.get("/members", getAllMembers);

// Get member by ID
router.get("/members/:id", getMemberById);


// Update member
// ⚠️ If your validator requires full body,
// remove memberSchema from here or create updateMemberSchema
// Delete member
router.delete("/members/:id", protect, adminOnly, deleteMember);

/* ==================== EVENT ROUTES ==================== */

router.post("/events", protect, adminOnly, eventSchema, validate, createEvent);

router.get("/events", getAllEvents);
router.get("/events/:id", getEventById);

router.put(
  "/events/:id",
  protect,
  adminOnly,
  eventSchema,
  validate,
  updateEvent,
);

router.delete("/events/:id", protect, adminOnly, deleteEvent);

/* ==================== SACRAMENTS & SUBGROUPS ==================== */

router.get("/sakraments", getAllSakraments);
router.get("/subgroups", getAllSubgroups);

/* ==================== EXTRA MODULES ==================== */

router.use("/attendance", attendanceRoutes);
router.use("/decision", decisionRoutes);

export default router;
