import { clerkClient, getAuth } from "@clerk/express";

import User from "../models/User.js";

const requireAuth = async(req, res, next) => {
    try {
        // Get authentication information from clerk
        const { isAuthenticated, userId } = getAuth(req);

        if(!isAuthenticated || !userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please sign in.",
            });
        }

        // Get the user's profile from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);

        const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

        if(!email) {
            return res.status(400).json({
                success: false,
                message: "Your Clerk account does not have an email address.",
            });
        }

        // Find the user in MongoDB or create a new one
        const dbUser = await User.findOneAndUpdate(
            { clerkId: userId },
            {
                $set: {
                    firstName: clerkUser.firstName || "",
                    lastName: clerkUser.lastName || "",
                    email,
                    imageUrl: clerkUser.imageUrl || "",
                },
                $setOnInsert: {
                    clerkId: userId,
                    plan: "free",
                    selectedModel: "gemini-3.1-flash-lite",
                    subscriptionStatus: "active",
                    isActive: true,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        if(!dbUser.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated.",
            });
        }

        // Attach MongDB user to the request
        req.dbUser = dbUser;

        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);

        res.status(500).json({
            success: false,
            message: "Authentication failed.",
        });
    }
};

export default requireAuth;