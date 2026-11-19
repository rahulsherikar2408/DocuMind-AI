import express from "express";

import requireAuth from "../middlewares/requireAuth.js";
import validateMessage from "../middlewares/validateMessage.js";

import {
  createChat,
  getChats,
  getChatById,
  sendMessage,
  getChatMessages,
} from "../controllers/chatController.js";

const router = express.Router();

// All chat routes require authentication.
router.use(requireAuth);

// Create a new chat.
router.post("/", createChat);

// Get all chats.
router.get("/", getChats);

// Get a specific chat.
router.get("/:id", getChatById);

// Send a message to a chat
router.post("/:id/messages", validateMessage, sendMessage);

router.get("/:id/messages", getChatMessages);

export default router;