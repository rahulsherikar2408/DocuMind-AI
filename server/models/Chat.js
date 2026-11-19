import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional: chat can be associated with one document.
    // If omitted, the chat can search across all user's documents.
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },

    title: {
      type: String,
      trim: true,
      default: "New Chat",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Retrieve a user's chats, newest activity first.
chatSchema.index({ user: 1, lastMessageAt: -1});

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;