import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Document from "../models/Document.js";

// POST /api/chats
// Create a new chat.
export const createChat = async(req, res) => {
    try {
        const { documentId } = req.body;

        let document = null;

        // Check whether a document was provided.
        if(documentId) {
            if(!mongoose.isValidObjectId(documentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid document ID.",
                });
            }

            // Ensure the document belongs to the logged-in user.
            document = await Document.findOne({
                _id: documentId,
                user: req.dbUser._id,
            });

            if(!document) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found.",
                });
            }

            if(document.status !== "completed") {
                return res.status(400).json({
                    success: false,
                    message: "This document is not ready for chatting yet.",
                });
            }
        }

        // Create the chat.
        const chat = await Chat.create({
            user: req.dbUser._id,
            document: document?._id || null,
            title: "New Chat",
            lastMessageAt: new Date(),
        });

        res.status(201).json({
            success: true,
            message: "Chat created successfully.",
            chat,
        });

    } catch (error) {
        console.error("Create chat error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create chat.",
        });
    }
};

// GET /api/chats
// Get all chats belonging to the logged-in user.
export const getChats = async(req, res) => {
    try {
        const chats = await Chat.find({
            user: req.dbUser._id,
        })
          .populate("document", "fileName pageCount status")
          .sort({ lastMessageAt: -1});

        res.status(200).json({
            success: true,
            count: chats.length,
            chats,
        });

    } catch (error) {
        console.error("Get chats error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve chats.",
        });
    }
};

// GET /api/chats/:id
// Get a specific chat belonging to the logged-in user.
export const getChatById = async(req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID.",
            });
        }

        const chat = await Chat.findOne({
            _id: id,
            user: req.dbUser._id,
        }).populate("document", "fileName pageCount status");

        if(!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found.",
            });
        }

        res.status(200).json({
            success: true,
            chat,
        });

    } catch (error) {
        console.error("Get chat error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve chat.",
        });
    }
};