import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { clerkMiddleware, getAuth } from "@clerk/express";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

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

// Start server after database connection
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
