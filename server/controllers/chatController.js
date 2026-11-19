import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Document from "../models/Document.js";

import generateRAGResponse from "../services/ragService.js";


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
                status: "completed",
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
            title: document ? `Chat with ${document.fileName}` : "New Chat",
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

        let chat = await Chat.findOne({
            _id: id,
            user: req.dbUser._id,
        }).populate("document", "fileName pageCount status");

        // If not found by chat ID, check if this ID is a document ID
        if (!chat) {
            const document = await Document.findOne({
                _id: id,
                user: req.dbUser._id,
            });

            if (document) {
                // Find existing chat for this document or create a new one
                chat = await Chat.findOne({
                    document: document._id,
                    user: req.dbUser._id,
                })
                  .populate("document", "fileName pageCount status")
                  .sort({ lastMessageAt: -1 });

                if (!chat) {
                    chat = await Chat.create({
                        user: req.dbUser._id,
                        document: document._id,
                        title: `Chat with ${document.fileName}`,
                        lastMessageAt: new Date(),
                    });
                    chat = await Chat.findById(chat._id).populate("document", "fileName pageCount status");
                }
            }
        }

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

export const sendMessage = async(req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        // 1. Validate chat ID
        if(!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID.",
            });
        }

        // 2. Find chat belonging to authenticated user
        let chat = await Chat.findOne({
            _id: id,
            user: req.dbUser._id,
        });

        // If not found by chat ID, check if ID is a document ID
        if (!chat) {
            chat = await Chat.findOne({
                document: id,
                user: req.dbUser._id,
            }).sort({ lastMessageAt: -1 });
        }

        if(!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found.",
            });
        }

        // 3. Save user message
        const userMessage = await Message.create({
            chat: chat._id,
            role: "user",
            content: content.trim(),
        });

        // 4. Generate AI response using RAG
        const ragResponse = await generateRAGResponse({
            question: content.trim(),
            userId: req.dbUser._id.toString(),
            documentId: chat.document ? chat.document.toString() : undefined,
        });

        // 5. Save assistant response
        const assistantMessage = await Message.create({
            chat: chat._id,
            role: "assistant",
            content: ragResponse.answer,
            sources: ragResponse.sources.map((source) => ({
                document: source.document,
                pageNumber: source.pageNumber,
                chunkIndex: source.chunkIndex,
                score: source.score,
            })),
        });

        // 6. Update chat information
        chat.lastMessageAt = new Date();

        if(chat.title === "New Chat") {
            chat.title = content.trim().slice(0, 50);
        }

        await chat.save();

        // 7. Return response
        res.status(200).json({
            success: true,
            message: "Message sent successfully.",
            userMessage,
            assistantMessage,
        });
    } catch (error) {
        console.error("Send message error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to generate an AI response. Please try again.",
        });
    }
};


export const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate chat ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID.",
      });
    }

    // 2. Verify chat ownership
    let chat = await Chat.findOne({
      _id: id,
      user: req.dbUser._id,
    });

    // If not found by chat ID, check if ID is a document ID
    if (!chat) {
      chat = await Chat.findOne({
        document: id,
        user: req.dbUser._id,
      }).sort({ lastMessageAt: -1 });
    }

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    // 3. Retrieve messages
    const messages = await Message.find({
      chat: chat._id,
    })
      .populate("sources.document", "fileName pageCount")
      .sort({ createdAt: 1 });

    // 4. Return messages
    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get chat messages error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve chat messages.",
    });
  }
};
