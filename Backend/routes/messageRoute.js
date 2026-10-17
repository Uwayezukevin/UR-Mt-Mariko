import express from "express";
import Message from "../models/message.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = express.Router();

const MAX_LENGTHS = { name: 120, email: 200, phone: 30, message: 2000 };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// SEND MESSAGE (public contact form)
router.post("/send", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !message || (!email && !phone)) {
      return res
        .status(400)
        .json({ message: "Name, message and either email or phone are required" });
    }

    if (
      name.length > MAX_LENGTHS.name ||
      (email && email.length > MAX_LENGTHS.email) ||
      (phone && phone.length > MAX_LENGTHS.phone) ||
      message.length > MAX_LENGTHS.message
    ) {
      return res.status(400).json({ message: "One or more fields are too long" });
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      message: message.trim(),
    });

    if (req.io) {
      req.io.emit("newMessage", newMessage);
    }

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL MESSAGES (admin only — contains visitor PII)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("getMessages error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// MARK MESSAGE AS READ (admin only)
router.patch("/:id/read", protect, adminOnly, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message marked as read", data: message });
  } catch (error) {
    console.error("markMessageRead error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
