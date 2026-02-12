import express from "express";
import Message from "../models/message.js";

const router = express.Router();

// SEND MESSAGE (guest or member)
router.post("/send", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !message || (!email && !phone)) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newMessage = await Message.create({
      name,
      email,
      phone,
      message,
    });

    // Emit socket event
    req.io.emit("newMessage", newMessage);

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL MESSAGES (admin dashboard)
router.get("/", async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

export default router;
