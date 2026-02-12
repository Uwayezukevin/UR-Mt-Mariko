import User from "../mongoschema/userschema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { username, useremail, userphoneNumber, userpassword, userrole } = req.body;

    const existingUser = await User.findOne({ useremail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(userpassword, 10);

    const user = await User.create({
      username,
      useremail,
      userphoneNumber,
      userpassword: hashedPassword,
      userrole: userrole || "admin",
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        useremail: user.useremail,
        userrole: user.userrole,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { useremail, userpassword } = req.body;

    const user = await User.findOne({ useremail });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(userpassword, user.userpassword);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, userrole: user.userrole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        useremail: user.useremail,
        userrole: user.userrole,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const logoutUser = async (req, res) => {
  
  res.status(200).json({ message: "Logout successful" });
};
