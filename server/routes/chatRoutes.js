import express from "express";

import requireAuth from "../middlewares/requireAuth.js";

import {
  createChat,
  getChats,
  getChatById,
  sendMessage,
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
router.post("/:id/messages", sendMessage);

export default router;