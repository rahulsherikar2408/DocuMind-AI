import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    pageNumber: {
      type: Number,
      required: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    // Sources are primarily used for assistant responses.
    sources: {
      type: [sourceSchema],
      default: [],
    },

    model: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Retrieve messages in chronological order.
messageSchema.index({ chat: 1, createdAt: 1 });

const Message =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);

export default Message;