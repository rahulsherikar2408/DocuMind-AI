import { getPlanConfig, resolveModelForUser } from "../config/plans.js";
import User from "../models/User.js";
import {
  getUserUsageSummary,
  invalidateUsageCache,
} from "./subscriptionController.js";
import { invalidateUserCache } from "../middlewares/requireAuth.js";

export const getCurrentUser = async (req, res) => {
  try {
    const dbUser = req.dbUser;
    const planDetails = getPlanConfig(dbUser.plan);
    const usage = await getUserUsageSummary(dbUser);

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully.",
      user: dbUser,
      planDetails,
      usage,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve user profile.",
    });
  }
};

export const updateSelectedModel = async (req, res) => {
  try {
    const { model } = req.body;
    const dbUser = req.dbUser;
    const planConfig = getPlanConfig(dbUser.plan);

    if (!model || typeof model !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid model identifier is required.",
      });
    }

    if (!planConfig.allowedModels.includes(model)) {
      return res.status(403).json({
        success: false,
        code: "MODEL_SWITCH_FORBIDDEN",
        message: `Your ${planConfig.name} plan only supports ${planConfig.allowedModels.join(", ")}. Upgrade to Pro to switch between Gemini models.`,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      dbUser._id,
      { $set: { selectedModel: model } },
      { new: true, runValidators: true }
    );

    invalidateUserCache(dbUser._id);
    invalidateUsageCache(dbUser._id);

    res.status(200).json({
      success: true,
      message: `Active model switched to ${model}.`,
      selectedModel: resolveModelForUser(updatedUser),
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update selected model error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update selected model.",
    });
  }
};
