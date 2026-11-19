
import express from "express";

import { generateSummary } from "../controllers/summaryController.js";
import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

// Generate summary for a specific document
router.post("/:documentId", requireAuth, generateSummary);

export default router;
