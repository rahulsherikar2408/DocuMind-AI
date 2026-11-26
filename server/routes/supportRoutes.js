import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import {
  createSupportTicket,
  getSupportTickets,
} from "../controllers/supportController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createSupportTicket);
router.get("/", getSupportTickets);

export default router;
