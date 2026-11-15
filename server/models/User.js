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
        enum: ["free", "pro", "team"],
        default: "free",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;