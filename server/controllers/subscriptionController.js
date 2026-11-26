import crypto from "node:crypto";
import razorpay from "../config/razorpay.js";
import {
  AVAILABLE_MODELS,
  PLANS,
  getPlanConfig,
  getStartOfToday,
  resolveModelForUser,
} from "../config/plans.js";
import Billing from "../models/Billing.js";
import Document from "../models/Document.js";
import User from "../models/User.js";
import { createSubscriptionNotification } from "../services/notificationService.js";
import { invalidateUserCache } from "../middlewares/requireAuth.js";

const SUBSCRIPTION_DURATION_DAYS = 30;

const usageCache = new Map();
const USAGE_CACHE_TTL_MS = 15 * 1000; // 15 seconds

export const invalidateUsageCache = (userId) => {
  if (userId) {
    usageCache.delete(userId.toString());
  }
};

export const getUserUsageSummary = async (dbUser) => {
  const userIdStr = dbUser._id.toString();
  const cached = usageCache.get(userIdStr);
  const now = Date.now();

  if (cached && now - cached.timestamp < USAGE_CACHE_TTL_MS) {
    return {
      ...cached.data,
      activeModel: resolveModelForUser(dbUser),
    };
  }

  const planConfig = getPlanConfig(dbUser.plan);
  const startOfDay = getStartOfToday();

  const todayUploadsCount = await Document.countDocuments({
    user: dbUser._id,
    createdAt: { $gte: startOfDay },
    status: { $ne: "failed" },
  });

  const dailyUploadLimit = planConfig.dailyUploadLimit;
  const remainingUploads =
    dailyUploadLimit === null
      ? null
      : Math.max(0, dailyUploadLimit - todayUploadsCount);

  const summary = {
    todayUploadsCount,
    dailyUploadLimit,
    remainingUploads,
    allowScannedOcr: planConfig.allowScannedOcr,
    allowedModels: planConfig.allowedModels,
    activeModel: resolveModelForUser(dbUser),
  };

  usageCache.set(userIdStr, { data: summary, timestamp: now });
  if (usageCache.size > 500) {
    const oldestKey = usageCache.keys().next().value;
    if (oldestKey) usageCache.delete(oldestKey);
  }

  return summary;
};

// GET /api/subscriptions/plans
export const getPlans = async (req, res) => {
  res.status(200).json({
    success: true,
    plans: Object.values(PLANS),
    models: Object.values(AVAILABLE_MODELS),
    keyId: process.env.RAZORPAY_KEY_ID || "",
  });
};

// GET /api/subscriptions/current
export const getCurrentSubscription = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    const planConfig = getPlanConfig(dbUser.plan);
    const usage = await getUserUsageSummary(dbUser);

    res.status(200).json({
      success: true,
      subscription: {
        plan: dbUser.plan,
        planDetails: planConfig,
        selectedModel: usage.activeModel,
        subscriptionStatus: dbUser.subscriptionStatus || "active",
        subscriptionStartDate: dbUser.subscriptionStartDate,
        subscriptionEndDate: dbUser.subscriptionEndDate,
        usage,
      },
    });
  } catch (error) {
    console.error("Get current subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve subscription details.",
    });
  }
};

// POST /api/subscriptions/create-order
export const createSubscriptionOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Razorpay payment gateway is not configured.",
      });
    }

    const { plan } = req.body;
    const dbUser = req.dbUser;

    if (!plan || !["plus", "pro"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid paid plan (plus or pro).",
      });
    }

    if (dbUser.plan === plan && dbUser.subscriptionStatus === "active") {
      return res.status(400).json({
        success: false,
        message: `You are already subscribed to the ${getPlanConfig(plan).name} plan.`,
      });
    }

    if (dbUser.plan === "pro" && plan === "plus") {
      return res.status(403).json({
        success: false,
        message: "You are already on the Pro plan. Downgrading to Plus is disabled.",
      });
    }

    const planConfig = getPlanConfig(plan);
    const receipt = `rcpt_${dbUser._id.toString().slice(-8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: planConfig.amountPaise,
      currency: planConfig.currency,
      receipt,
      notes: {
        userId: dbUser._id.toString(),
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        plan: planConfig.id,
      },
    });

    const billing = await Billing.create({
      user: dbUser._id,
      plan: planConfig.id,
      previousPlan: dbUser.plan || "free",
      amount: planConfig.priceInr,
      amountPaise: planConfig.amountPaise,
      currency: planConfig.currency,
      paymentGateway: "razorpay",
      razorpayOrderId: order.id,
      receipt,
      status: "created",
      notes: {
        planName: planConfig.name,
        email: dbUser.email,
      },
    });

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully.",
      keyId: process.env.RAZORPAY_KEY_ID,
      order,
      plan: planConfig,
      billingId: billing._id,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Unable to initiate Razorpay payment order.",
    });
  }
};

// POST /api/subscriptions/verify-payment
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment verification parameters.",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay key secret is not configured.",
      });
    }

    const billing = await Billing.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.dbUser._id,
    });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing order not found for this user.",
      });
    }

    // Verify HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(String(razorpay_signature), "utf8");

    const isSignatureValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isSignatureValid) {
      billing.status = "failed";
      billing.razorpayPaymentId = razorpay_payment_id;
      billing.razorpaySignature = razorpay_signature;
      billing.failureReason = "Invalid payment signature";
      await billing.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    const targetPlan = ["plus", "pro"].includes(billing.plan)
      ? billing.plan
      : plan;

    if (!["plus", "pro"].includes(targetPlan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan on billing record.",
      });
    }

    // Fetch payment method from Razorpay if available
    let paymentMethod = "";
    if (razorpay) {
      try {
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        paymentMethod = paymentDetails?.method || "";
      } catch (fetchErr) {
        console.warn("Could not fetch Razorpay payment details:", fetchErr.message);
      }
    }

    const now = new Date();
    const periodEnd = new Date(
      now.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000
    );

    billing.status = "paid";
    billing.razorpayPaymentId = razorpay_payment_id;
    billing.razorpaySignature = razorpay_signature;
    billing.paymentMethod = paymentMethod;
    billing.paidAt = now;
    billing.billingPeriodStart = now;
    billing.billingPeriodEnd = periodEnd;
    billing.failureReason = "";
    await billing.save();

    const planConfig = getPlanConfig(targetPlan);
    const updatedUser = await User.findByIdAndUpdate(
      req.dbUser._id,
      {
        $set: {
          plan: targetPlan,
          selectedModel: planConfig.defaultModel,
          subscriptionStatus: "active",
          subscriptionStartDate: now,
          subscriptionEndDate: periodEnd,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true, runValidators: true }
    );

    invalidateUserCache(req.dbUser._id);
    invalidateUsageCache(req.dbUser._id);

    const usage = await getUserUsageSummary(updatedUser);

    await createSubscriptionNotification({
      userId: req.dbUser._id,
      plan: targetPlan,
      expiresAt: periodEnd,
      billingId: billing._id,
    });

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to the ${planConfig.name} plan!`,
      user: updatedUser,
      billing,
      subscription: {
        plan: updatedUser.plan,
        planDetails: planConfig,
        selectedModel: usage.activeModel,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionStartDate: updatedUser.subscriptionStartDate,
        subscriptionEndDate: updatedUser.subscriptionEndDate,
        usage,
      },
    });
  } catch (error) {
    console.error("Verify Razorpay payment error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please contact support.",
    });
  }
};

// POST /api/subscriptions/record-failure
export const recordPaymentFailure = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, reason } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID is required.",
      });
    }

    const billing = await Billing.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.dbUser._id,
    });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: "Billing order not found.",
      });
    }

    if (billing.status === "paid") {
      return res.status(200).json({
        success: true,
        billing,
      });
    }

    billing.status = "failed";
    if (razorpay_payment_id) {
      billing.razorpayPaymentId = razorpay_payment_id;
    }
    billing.failureReason = reason || "Payment cancelled or failed.";
    await billing.save();

    res.status(200).json({
      success: true,
      message: "Payment failure recorded.",
      billing,
    });
  } catch (error) {
    console.error("Record payment failure error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to record payment failure.",
    });
  }
};

// POST /api/subscriptions/downgrade-free
export const downgradeToFree = async (req, res) => {
  try {
    const dbUser = req.dbUser;

    if (dbUser.plan === "free") {
      return res.status(400).json({
        success: false,
        message: "You are already on the Free plan.",
      });
    }

    if (dbUser.plan === "plus" || dbUser.plan === "pro") {
      return res.status(403).json({
        success: false,
        message: `Switching from ${getPlanConfig(dbUser.plan).name} to Free is disabled.`,
      });
    }

    const previousPlan = dbUser.plan;
    const freeConfig = getPlanConfig("free");

    const updatedUser = await User.findByIdAndUpdate(
      dbUser._id,
      {
        $set: {
          plan: "free",
          selectedModel: freeConfig.defaultModel,
          subscriptionStatus: "active",
          subscriptionEndDate: null,
        },
      },
      { new: true, runValidators: true }
    );

    invalidateUserCache(dbUser._id);
    invalidateUsageCache(dbUser._id);

    const billing = await Billing.create({
      user: dbUser._id,
      plan: "free",
      previousPlan,
      amount: 0,
      amountPaise: 0,
      currency: "INR",
      paymentGateway: "system",
      receipt: `free_${dbUser._id.toString().slice(-8)}_${Date.now()}`,
      status: "paid",
      paymentMethod: "plan_switch",
      paidAt: new Date(),
      notes: {
        action: "downgrade_to_free",
        previousPlan,
      },
    });

    const usage = await getUserUsageSummary(updatedUser);

    res.status(200).json({
      success: true,
      message: "Switched to the Free plan.",
      user: updatedUser,
      billing,
      usage,
    });
  } catch (error) {
    console.error("Downgrade to free error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to switch to Free plan.",
    });
  }
};

// GET /api/subscriptions/billing-history
export const getBillingHistory = async (req, res) => {
  try {
    const billings = await Billing.find({
      user: req.dbUser._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: billings.length,
      billings,
    });
  } catch (error) {
    console.error("Get billing history error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve billing history.",
    });
  }
};
