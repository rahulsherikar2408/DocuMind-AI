
import express from "express";

import {
    getSuggestedQuestions,
} from "../controllers/suggestedQuestionsController.js";

import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

// Generate suggested questions for a document
router.get("/:documentId", requireAuth, getSuggestedQuestions);

export default router;
