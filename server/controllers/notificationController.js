import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { ensureExpiryReminderNotification } from "../services/notificationService.js";

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    await ensureExpiryReminderNotification(req.dbUser);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({
        user: req.dbUser._id,
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
      Notification.countDocuments({
        user: req.dbUser._id,
        isRead: false,
      }),
    ]);

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve notifications.",
    });
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.dbUser._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.dbUser._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
    });
  }
};
