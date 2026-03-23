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

    // Emit socket event - FIX: Check if req.io exists
    if (req.io) {
      req.io.emit("newMessage", newMessage);
    }

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error); // Added error logging
    res.status(500).json({ message: error.message });
  }
});

// GET ALL MESSAGES (admin dashboard)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;