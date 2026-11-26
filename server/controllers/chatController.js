import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Document from "../models/Document.js";

import { getPlanConfig, resolveModelForUser } from "../config/plans.js";
import generateRAGResponse from "../services/ragService.js";

const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const generateUniqueChatTitle = async (userId, baseTitle, excludeChatId = null) => {
    const trimmedTitle = (baseTitle || "New Chat").trim();
    const escaped = escapeRegex(trimmedTitle);
    const regex = new RegExp(`^${escaped}(?: \\((\\d+)\\))?$`);

    const query = {
        user: userId,
        title: { $regex: regex },
    };

    if (excludeChatId) {
        query._id = { $ne: excludeChatId };
    }

    const matchingChats = await Chat.find(query).select("title").lean();

    const hasExactBase = matchingChats.some((c) => c.title === trimmedTitle);

    if (!hasExactBase) {
        return trimmedTitle;
    }

    const suffixRegex = new RegExp(`^${escaped} \\((\\d+)\\)$`);
    const suffixSet = new Set();

    for (const c of matchingChats) {
        const match = c.title.match(suffixRegex);
        if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num)) {
                suffixSet.add(num);
            }
        }
    }

    let suffix = 1;
    while (suffixSet.has(suffix)) {
        suffix++;
    }

    return `${trimmedTitle} (${suffix})`;
};


// POST /api/chats
// Create a new chat.
export const createChat = async(req, res) => {
    try {
        const { documentId, title: customTitle } = req.body;

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

        const baseTitle = customTitle?.trim() || (document ? `Chat with ${document.fileName}` : "New Chat");
        const title = await generateUniqueChatTitle(req.dbUser._id, baseTitle);

        // Create the chat.
        const chat = await Chat.create({
            user: req.dbUser._id,
            document: document?._id || null,
            title,
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
          .sort({ lastMessageAt: -1 })
          .lean();

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
                    const baseTitle = `Chat with ${document.fileName}`;
                    const title = await generateUniqueChatTitle(req.dbUser._id, baseTitle);
                    chat = await Chat.create({
                        user: req.dbUser._id,
                        document: document._id,
                        title,
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
        const { content, model: requestedModel } = req.body;

        const planConfig = getPlanConfig(req.dbUser.plan);
        if (requestedModel && !planConfig.allowedModels.includes(requestedModel)) {
            return res.status(403).json({
                success: false,
                code: "MODEL_SWITCH_FORBIDDEN",
                message: `Model ${requestedModel} is only available on the Pro plan.`,
            });
        }

        const activeModel = resolveModelForUser(req.dbUser, requestedModel);

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
            model: activeModel,
        });

        // 5. Save assistant response
        const assistantMessage = await Message.create({
            chat: chat._id,
            role: "assistant",
            content: ragResponse.answer,
            model: ragResponse.model || activeModel,
            sources: ragResponse.sources.map((source) => ({
                document: source.document,
                pageNumber: source.pageNumber,
                chunkIndex: source.chunkIndex,
                score: source.score,
            })),
        });

        // 6. Update chat information
        chat.lastMessageAt = new Date();

        if (chat.title === "New Chat" || /^New Chat( \(\d+\))?$/.test(chat.title)) {
            const candidateTitle = content.trim().slice(0, 50);
            chat.title = await generateUniqueChatTitle(req.dbUser._id, candidateTitle, chat._id);
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

// DELETE /api/chats/:id
// Delete a chat and its messages belonging to the logged-in user.
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID.",
      });
    }

    const chat = await Chat.findOne({
      _id: id,
      user: req.dbUser._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    // Delete all messages associated with this chat
    await Message.deleteMany({ chat: chat._id });

    // Delete the chat itself
    await Chat.findByIdAndDelete(chat._id);

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully.",
    });
  } catch (error) {
    console.error("Delete chat error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete chat.",
    });
  }
};
