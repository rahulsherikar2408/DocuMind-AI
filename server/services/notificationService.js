import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getPlanConfig } from "../config/plans.js";

const formatExpiryDate = (dateValue) => {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getLocalDayKey = (dateValue) => {
  const d = new Date(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const createSubscriptionNotification = async ({
  userId,
  plan,
  expiresAt,
  billingId,
}) => {
  const planConfig = getPlanConfig(plan);
  const formattedDate = formatExpiryDate(expiresAt);

  return Notification.create({
    user: userId,
    type: "subscription_purchased",
    title: "Subscription Activated",
    message: `You have subscribed to ${planConfig.name} plan, and it will expire on ${formattedDate}.`,
    isRead: false,
    metadata: {
      plan: planConfig.id,
      expiresAt,
      billingId: billingId ? billingId.toString() : "",
    },
  });
};

export const ensureExpiryReminderNotification = async (dbUser) => {
  if (
    !dbUser ||
    !["plus", "pro"].includes(dbUser.plan) ||
    dbUser.subscriptionStatus !== "active" ||
    !dbUser.subscriptionEndDate
  ) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(dbUser.subscriptionEndDate);

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfEndDay = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  const diffDays = Math.round(
    (startOfEndDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays !== 1) {
    return null;
  }

  const expiryKey = getLocalDayKey(endDate);

  const existing = await Notification.findOne({
    user: dbUser._id,
    type: "plan_expiring_tomorrow",
    "metadata.expiryKey": expiryKey,
    "metadata.plan": dbUser.plan,
  }).lean();

  if (existing) {
    return null;
  }

  return Notification.create({
    user: dbUser._id,
    type: "plan_expiring_tomorrow",
    title: "Plan Expiring Tomorrow",
    message: "Your plan ends tomorrow, please renew it",
    isRead: false,
    metadata: {
      plan: dbUser.plan,
      expiresAt: endDate,
      expiryKey,
    },
  });
};

export const scanUsersForExpiryReminders = async () => {
  try {
    const now = new Date();
    const tomorrowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const tomorrowEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 2
    );

    const expiringUsers = await User.find({
      plan: { $in: ["plus", "pro"] },
      subscriptionStatus: "active",
      subscriptionEndDate: {
        $gte: tomorrowStart,
        $lt: tomorrowEnd,
      },
    });

    for (const user of expiringUsers) {
      await ensureExpiryReminderNotification(user);
    }
  } catch (error) {
    console.error("Expiry reminder scan error:", error.message);
  }
};
