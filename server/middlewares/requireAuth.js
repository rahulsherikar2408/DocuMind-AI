import { clerkClient, getAuth } from "@clerk/express";

import User from "../models/User.js";

// In-memory cache for authenticated users to avoid repetitive DB lookups on simultaneous requests
const userCache = new Map();
const USER_CACHE_TTL_MS = 30 * 1000; // 30 seconds

export const invalidateUserCache = (userIdOrClerkId) => {
  if (!userIdOrClerkId) return;
  const key = userIdOrClerkId.toString();
  userCache.delete(key);
  for (const [k, v] of userCache.entries()) {
    if (v.user?._id?.toString() === key || v.user?.clerkId === key) {
      userCache.delete(k);
    }
  }
};

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

        const now = Date.now();
        const cached = userCache.get(userId);
        let dbUser = null;

        if (cached && now - cached.timestamp < USER_CACHE_TTL_MS) {
            dbUser = cached.user;
        } else {
            // Fast path: look up existing user directly in MongoDB without calling Clerk REST API
            dbUser = await User.findOne({ clerkId: userId }).lean();

            if (!dbUser) {
                // First-time user: fetch profile from Clerk and upsert into MongoDB
                const clerkUser = await clerkClient.users.getUser(userId);

                const email =
                    clerkUser.primaryEmailAddress?.emailAddress ||
                    clerkUser.emailAddresses[0]?.emailAddress;

                if (!email) {
                    return res.status(400).json({
                        success: false,
                        message: "Your Clerk account does not have an email address.",
                    });
                }

                dbUser = await User.findOneAndUpdate(
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
                ).lean();
            }

            if (dbUser) {
                userCache.set(userId, { user: dbUser, timestamp: now });
                if (userCache.size > 500) {
                    const oldestKey = userCache.keys().next().value;
                    if (oldestKey) userCache.delete(oldestKey);
                }
            }
        }

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
