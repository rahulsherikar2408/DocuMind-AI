import SupportTicket from "../models/SupportTicket.js";
import Notification from "../models/Notification.js";

// POST /api/support
export const createSupportTicket = async (req, res) => {
  try {
    const { subject, message, category = "general" } = req.body;
    const dbUser = req.dbUser;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a subject for your support request.",
      });
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message of at least 10 characters.",
      });
    }

    const validCategory = ["general", "billing", "technical", "ocr", "other"].includes(
      category
    )
      ? category
      : "general";

    const fullName = dbUser.firstName
      ? `${dbUser.firstName} ${dbUser.lastName || ""}`.trim()
      : "";

    const ticket = await SupportTicket.create({
      user: dbUser._id,
      name: fullName,
      email: dbUser.email,
      category: validCategory,
      subject: subject.trim().slice(0, 150),
      message: message.trim().slice(0, 2000),
      status: "open",
    });

    await Notification.create({
      user: dbUser._id,
      type: "general",
      title: "Support Request Received",
      message: `Your support request "${ticket.subject}" has been logged. Our team will reach out to ${dbUser.email}.`,
      isRead: false,
      metadata: {
        ticketId: ticket._id.toString(),
        category: ticket.category,
      },
    });

    res.status(201).json({
      success: true,
      message: "Support request submitted successfully! We'll get back to you soon.",
      ticket,
    });
  } catch (error) {
    console.error("Create support ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to submit support request. Please try again.",
    });
  }
};

// GET /api/support
export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      user: req.dbUser._id,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get support tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load support requests.",
    });
  }
};
