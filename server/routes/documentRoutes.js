import express from "express";
import requireAuth from "../middlewares/requireAuth.js";

import {
  getDocuments,
  getDocumentById,
} from "../controllers/documentController.js";

const router = express.Router();

// All document routes require authentication
router.use(requireAuth);

// GET /api/documents
router.get("/", getDocuments);

// GET /api/documents/:id
router.get("/:id", getDocumentById);

export default router;