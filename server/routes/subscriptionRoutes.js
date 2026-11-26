import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import {
  getPlans,
  getCurrentSubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  recordPaymentFailure,
  downgradeToFree,
  getBillingHistory,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Publicly readable plan details
router.get("/plans", getPlans);

// Authenticated subscription & billing routes
router.use(requireAuth);

router.get("/current", getCurrentSubscription);
router.post("/create-order", createSubscriptionOrder);
router.post("/verify-payment", verifySubscriptionPayment);
router.post("/record-failure", recordPaymentFailure);
router.post("/downgrade-free", downgradeToFree);
router.get("/billing-history", getBillingHistory);

export default router;
