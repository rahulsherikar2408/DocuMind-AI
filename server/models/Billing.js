import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "plus", "pro"],
      required: true,
    },
    previousPlan: {
      type: String,
      enum: ["free", "plus", "pro"],
      default: "free",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentGateway: {
      type: String,
      enum: ["razorpay", "system"],
      default: "razorpay",
    },
    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
    receipt: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    paymentMethod: {
      type: String,
      default: "",
    },
    billingPeriodStart: {
      type: Date,
      default: null,
    },
    billingPeriodEnd: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: "",
    },
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

billingSchema.index({ user: 1, createdAt: -1 });

const Billing =
  mongoose.models.Billing || mongoose.model("Billing", billingSchema);

export default Billing;
