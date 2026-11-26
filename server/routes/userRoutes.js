import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import {
  getCurrentUser,
  updateSelectedModel,
} from "../controllers/userController.js";

const router = express.Router();

// Get /api/users/me
router.get("/me", requireAuth, getCurrentUser);

// PATCH /api/users/model
router.patch("/model", requireAuth, updateSelectedModel);

export default router;
