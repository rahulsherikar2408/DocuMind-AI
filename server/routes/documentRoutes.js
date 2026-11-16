import express from "express";

import requireAuth from "../middlewares/requireAuth.js";
import upload from "../middlewares/uploadMiddleware.js";

import {
  getDocuments,
  getDocumentById,
  uploadDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// All document routes require authentication
router.use(requireAuth);

// Upload a PDF
router.post("/upload", upload.single("file"), uploadDocument);

// GET /api/documents
router.get("/", getDocuments);

// GET /api/documents/:id
router.get("/:id", getDocumentById);

export default router;