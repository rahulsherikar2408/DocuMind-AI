import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { clerkMiddleware, getAuth } from "@clerk/express";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import suggestedQuestionsRoutes from "./routes/suggestedQuestionsRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import { scanUsersForExpiryReminders } from "./services/notificationService.js";

const app = express();

// Clerk middleware
app.use(clerkMiddleware());

// Security header
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health-check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DocuMind AI API is running!",
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/suggested-questions", suggestedQuestionsRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to DocuMind AI API");
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// Handle upload and other API errors
app.use((error, req, res, next) => {
  if(error instanceof multer.MulterError) {
    if(error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File size cannot exceed 10 MB.",
      });
    }

    if(error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Only one file can be uploaded at a time.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Handle file type validations errors
  if (
    error.message === "Only PDF files are allowed." ||
    error.message ===
      "Only PDF and scanned image files (PNG, JPG, JPEG, WEBP) are allowed." ||
    error.message ===
      "Invalid file type. Please upload a PDF or a scanned image (PNG, JPG, WEBP)."
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Unhandled server error:", error);

  res.status(error.statusCode || error.status || 500).json({
    success: false,
    message: error.message || "Internal server error.",
  });
});

// Start server after database connection
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      scanUsersForExpiryReminders();
      setInterval(scanUsersForExpiryReminders, 60 * 60 * 1000);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
