import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    // Document owner
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Original uploaded file name
    fileName: {
        type: String,
        required: true,
        trim: true,
    },
    // File information
    fileSize: {
        type: Number,
        required: true,
        min: 0,
    },
    mimeType: {
        type: String,
        default: "application/pdf",
    },
    pageCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    // File storage information
    storageProvider: {
        type: String,
        enum: ["cloudinary", "s3"],
        default: "cloudinary",
    },
    storageUrl: {
        type: String,
        default: "",
    },
    storageKey: {
        type: String,
        default: "",
    },
    // Document processing status
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
    },
    errorMessage: {
        type: String,
        default: "",
    },
    processedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

// Retrieve a user's document efficiently
documentSchema.index({ user: 1, createdAt: -1});

// Filter documents by user and processing status
documentSchema.index({ user: 1, status: 1});

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;