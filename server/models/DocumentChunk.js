import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    pageNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    text: {
      type: String,
      required: true,
    },
    characterCount: {
      type: Number,
      required: true,
      min: 0,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true },
);

// Prevent duplicate chunk indexes within a document.
documentChunkSchema.index(
    { document: 1, chunkIndex: 1 },
    { unique: true }
);

// Useful when retrieving a user's chunks for a document.
documentChunkSchema.index({ user: 1, document: 1 });

const DocumentChunk = mongoose.models.DocumentChunk || mongoose.model("DocumentChunk", documentChunkSchema);

export default DocumentChunk;