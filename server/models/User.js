import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Unique ID provided by Clerk
    clerkId: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
    },
    firstName:{
        type: String,
        trim: true,
        default: "",
    },
    lastName: {
        type: String,
        trim: true,
        default: "",
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        default: "",
    },

    // Subscription Plan
    plan: {
        type: String,
        enum: ["free", "plus", "pro"],
        default: "free",
    },
    selectedModel: {
        type: String,
        enum: ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"],
        default: "gemini-3.1-flash-lite",
    },
    subscriptionStatus: {
        type: String,
        enum: ["active", "inactive", "cancelled", "expired"],
        default: "active",
    },
    subscriptionStartDate: {
        type: Date,
        default: null,
    },
    subscriptionEndDate: {
        type: Date,
        default: null,
    },
    razorpayOrderId: {
        type: String,
        default: "",
    },
    razorpayPaymentId: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;