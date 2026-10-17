import User from "../mongoschema/userschema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const BCRYPT_ROUNDS = 12;

const buildUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  useremail: user.useremail,
  userphonenumber: user.userphonenumber,
  userrole: user.userrole,
});

const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id: user._id }, secret, { expiresIn: "1d" });
};

// ===================== REGISTER =====================
// SECURITY: registration is only open when there is no user yet (bootstrap).
// After the first admin exists, additional accounts must be created by an admin.
export const registerUser = async (req, res) => {
  try {
    const { username, useremail, userphonenumber, userpassword, userrole } =
      req.body;

    const userCount = await User.countDocuments();
    const isBootstrap = userCount === 0;

    if (!isBootstrap) {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Registration is closed. Ask an administrator to create your account.",
        });
      }
      if (req.user.userrole !== "admin") {
        return res.status(403).json({
          message: "Only administrators can create new accounts",
        });
      }
    }

    const existingUser = await User.findOne({
      $or: [{ useremail }, { userphonenumber }],
    });
    if (existingUser) {
      const field =
        existingUser.useremail === useremail?.toLowerCase()
          ? "Email"
          : "Phone number";
      return res.status(409).json({ message: `${field} already registered` });
    }

    const hashedPassword = await bcrypt.hash(userpassword, BCRYPT_ROUNDS);

    // First account is always admin; later accounts default to editor
    // and only an admin may explicitly choose a role.
    let role = "editor";
    if (isBootstrap) {
      role = "admin";
    } else if (req.user?.userrole === "admin" && userrole) {
      role = userrole;
    }

    const user = await User.create({
      username,
      useremail,
      userphonenumber,
      userpassword: hashedPassword,
      userrole: role,
    });

    res.status(201).json({
      message: "User created successfully",
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("registerUser error:", err.message);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email or phone already used" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== LOGIN =====================
export const loginUser = async (req, res) => {
  try {
    const { useremail, userpassword } = req.body;

    if (!useremail || !userpassword) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ useremail });
    // Constant response for unknown email vs wrong password
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(userpassword, user.userpassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    // Also set an httpOnly-style cookie flag off (token returned in body;
    // the frontend stores it. Cookie set for same-site deployments).
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("loginUser error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== LOGOUT =====================
export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Logout successful" });
};
