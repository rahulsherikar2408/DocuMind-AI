import express from "express";

import requireAuth from "../middlewares/requireAuth.js";
import upload from "../middlewares/uploadMiddleware.js";
import validatePDF from "../middlewares/validatePDF.js";

import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// All document routes require authentication
router.use(requireAuth);

// Upload a PDF or scanned document
router.post("/upload", upload.single("file"), validatePDF , uploadDocument);

// GET /api/documents
router.get("/", getDocuments);

// GET /api/documents/:id
router.get("/:id", getDocumentById);

// DELETE /api/documents/:id
router.delete("/:id", deleteDocument);

export default router;