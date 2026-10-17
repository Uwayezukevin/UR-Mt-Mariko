import express from "express";
import validate from "../middlewares/validate.js";
import { protect, adminOnly, optionalAuth } from "../middlewares/auth.js";

// Validators
import {
  userSchema,
  userLoginSchema,
} from "../validators/userValidator.js";
import {
  createMemberSchema,
  updateMemberSchema,
} from "../validators/memberValidator.js";
import { eventSchema, updateEventSchema } from "../validators/eventValidator.js";

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
// Registration is bootstrap-public (first account) and admin-gated after
// that — enforced inside registerUser via optionalAuth-populated req.user.
router.post(
  "/users/register",
  optionalAuth,
  userSchema,
  validate,
  registerUser
);
router.post("/users/login", userLoginSchema, validate, loginUser);
router.post("/users/logout", logoutUser);

/* ==================== MEMBER ROUTES ====================
 * GET routes stay public (landing-page search + registration form) but
 * controllers strip sensitive fields (nationalId, phone) for anonymous
 * callers. Create stays public because the landing page has a join form.
 */
router.get("/members/search", searchMembers);
router.get("/members", getAllMembers);
router.get("/members/:id", optionalAuth, getMemberById);
router.post(
  "/members",
  optionalAuth,
  createMemberSchema,
  validate,
  createMember
);

/* ==================== PROTECTED MEMBER ROUTES (ADMIN ONLY) ==================== */
router.put(
  "/members/:id",
  protect,
  adminOnly,
  updateMemberSchema,
  validate,
  updateMember
);
router.delete("/members/:id", protect, adminOnly, deleteMember);
router.get("/members/:id/family", protect, getMemberWithFamily);
router.get("/members/:id/family-tree", protect, getFamilyTree);
router.get("/families", protect, getMembersByFamily);

/* ==================== PUBLIC EVENT ROUTES ==================== */
router.get("/events", getAllEvents);
router.get("/events/:id", getEventById);

/* ==================== PROTECTED EVENT ROUTES (ADMIN ONLY) ==================== */
router.post(
  "/events",
  protect,
  adminOnly,
  eventSchema,
  validate,
  createEvent
);
// Partial updates allowed (all fields optional) so PUT doesn't force a full payload
router.put(
  "/events/:id",
  protect,
  adminOnly,
  updateEventSchema,
  validate,
  updateEvent
);
router.delete("/events/:id", protect, adminOnly, deleteEvent);

/* ==================== PUBLIC SAKRAMENTS & SUBGROUPS ==================== */
router.get("/sakraments", getAllSakraments);
router.get("/subgroups", getAllSubgroups);

/* ==================== ATTENDANCE & DECISION ROUTES ==================== */
router.use("/attendance", attendanceRoutes);
router.use("/decision", decisionRoutes);

export default router;
