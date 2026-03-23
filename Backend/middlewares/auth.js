import jwt from "jsonwebtoken";
import User from "../mongoschema/userschema.js";

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    
    res.status(401).json({ message: "Not authorized" });
  }
};

// Admin only
export const adminOnly = (req, res, next) => {
  // 🔒 Check if user exists first
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // 🔒 Then check role
  if (req.user.userrole !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }

  next();
};