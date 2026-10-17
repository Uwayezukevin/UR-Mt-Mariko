import jwt from "jsonwebtoken";
import User from "../mongoschema/userschema.js";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("FATAL: JWT_SECRET is not defined in environment");
    return null;
  }
  return secret;
};

// Extract token from Authorization header or cookie
const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
};

// Protect routes
export const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const secret = getSecret();
  if (!secret) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, secret);

    // Exclude the password hash — field is named "userpassword"
    const user = await User.findById(decoded.id).select("-userpassword");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ message: "Not authorized" });
  }
};

// Attach req.user when a valid token is present, but never reject.
// Used on routes that are public only for a bootstrap/first-run case.
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  const secret = getSecret();
  if (!token || !secret) return next();

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("-userpassword");
    if (user) req.user = user;
  } catch {
    // Ignore invalid/expired token on optional auth
  }
  next();
};

// Admin only
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.userrole !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }

  next();
};
