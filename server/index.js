import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { clerkMiddleware, getAuth } from "@clerk/express";

import connectDB from "./config/db.js";

const app = express();

// Clerk middleware
app.use(clerkMiddleware());

// Security header
app.use(helmet());

// Middleware
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

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to DocuMind AI API");
});

// Protected authentication test route
app.get("/api/auth/me", (req, res) => {
  const { isAuthenticated, userId } = getAuth(req);

  if(!isAuthenticated) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please sign in."
    })
  }

  res.status(200).json({
    success: true,
    message:"Authentication successfyl!",
    userId,
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
