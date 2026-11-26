import mongoose from "mongoose";

import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

import cloudinary from "../config/cloudinary.js";
import {
  getPlanConfig,
  getStartOfToday,
  resolveModelForUser,
} from "../config/plans.js";
import uploadPDFToCloudinary, {
  deleteDocumentFromCloudinary,
} from "../services/cloudinaryService.js";
import processAndStorePDF from "../services/documentProcessingService.js";
import { inspectPDFText } from "../services/pdfService.js";

export const getDocumentDownloadUrl = (doc) => {
  if (!doc) return "";

  if (doc.storageProvider === "cloudinary" || !doc.storageProvider) {
    let publicId = doc.storageKey;
    let cldType = "authenticated";
    const isImage =
      doc.storageResourceType === "image" ||
      (doc.mimeType && doc.mimeType.startsWith("image/"));
    const resourceType = isImage ? "image" : "raw";

    if (doc.storageUrl) {
      if (
        doc.storageUrl.includes("/raw/upload/") ||
        doc.storageUrl.includes("/image/upload/")
      ) {
        cldType = "upload";
      }
      if (!publicId) {
        const match = doc.storageUrl.match(
          /\/(?:raw|image)\/(?:authenticated|upload)\/(?:v\d+\/)?(.+?)(?:\?.*)?$/
        );
        if (match) {
          publicId = match[1];
        }
      }
    }

    if (publicId) {
      try {
        if (resourceType === "image") {
          return cloudinary.url(publicId, {
            resource_type: "image",
            type: cldType,
            sign_url: true,
            secure: true,
          });
        }

        return cloudinary.utils.private_download_url(publicId, "", {
          resource_type: "raw",
          type: cldType,
        });
      } catch (err) {
        console.error("Error generating Cloudinary download URL:", err);
      }
    }
  }

  return doc.storageUrl || "";
};

// Get all documents belonging to the logged-in user
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      user: req.dbUser._id,
    }).sort({ createdAt: -1 });

    const formattedDocuments = documents.map((doc) => {
      const docObj = doc.toObject();
      docObj.storageUrl = getDocumentDownloadUrl(docObj);
      return docObj;
    });

    res.status(200).json({
      success: true,
      count: formattedDocuments.length,
      documents: formattedDocuments,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve documents.",
    });
  }
};

// Get one document belonging to the logged-in user
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB document ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID.",
      });
    }

    // Check both document ID and ownership
    const document = await Document.findOne({
      _id: id,
      user: req.dbUser._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const documentObj = document.toObject();
    documentObj.storageUrl = getDocumentDownloadUrl(documentObj);

    res.status(200).json({
      success: true,
      document: documentObj,
    });
  } catch (error) {
    console.error("Get document error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve document.",
    });
  }
};

export const uploadDocument = async (req, res) => {
  let uploadedFile;
  let document;

  try {
    const { buffer, originalname, mimetype, size } = req.file;
    const planConfig = getPlanConfig(req.dbUser.plan);

    // Step 0A: Enforce per-plan daily upload limit
    if (planConfig.dailyUploadLimit !== null) {
      const startOfDay = getStartOfToday();
      const todayUploadsCount = await Document.countDocuments({
        user: req.dbUser._id,
        createdAt: { $gte: startOfDay },
        status: { $ne: "failed" },
      });

      if (todayUploadsCount >= planConfig.dailyUploadLimit) {
        return res.status(403).json({
          success: false,
          code: "DAILY_LIMIT_REACHED",
          message: `Daily upload limit reached (${todayUploadsCount}/${planConfig.dailyUploadLimit} documents today on the ${planConfig.name} plan). Please upgrade your plan to upload more documents.`,
        });
      }
    }

    // Step 0B: Detect scanned documents / OCR requirement & enforce plan permissions
    const isImage = mimetype.startsWith("image/");
    const forceOcr = req.body?.ocr === "true" || req.body?.ocr === true;
    let pdfInspection = null;
    let isScanned = false;

    if (isImage) {
      isScanned = true;
      if (!planConfig.allowScannedOcr) {
        return res.status(403).json({
          success: false,
          code: "OCR_PLAN_REQUIRED",
          message:
            "Scanned image uploads and OCR are only available on Plus and Pro plans. Please upgrade your plan in Settings.",
        });
      }
    } else {
      pdfInspection = await inspectPDFText(buffer);
      isScanned = pdfInspection.isScanned || forceOcr;

      if (isScanned && !planConfig.allowScannedOcr) {
        return res.status(403).json({
          success: false,
          code: "OCR_PLAN_REQUIRED",
          message:
            "No extractable text was found in this PDF. Uploading scanned documents (OCR) is only available on Plus and Pro plans.",
        });
      }
    }

    // Step 1: Upload file to Cloudinary
    uploadedFile = await uploadPDFToCloudinary(buffer, originalname, mimetype);

    // Step 2: Create document record.
    document = await Document.create({
      user: req.dbUser._id,
      fileName: originalname,
      fileSize: size,
      mimeType: mimetype,
      pageCount: pdfInspection?.pageCount || (isImage ? 1 : 0),
      chunkCount: 0,
      storageProvider: "cloudinary",
      storageResourceType:
        uploadedFile.storageResourceType || (isImage ? "image" : "raw"),
      storageUrl: uploadedFile.secure_url,
      storageKey: uploadedFile.public_id,
      isScanned,
      extractionMethod: isScanned ? "ocr" : "text",
      status: "processing",
    });

    // Step 3: Extract text (directly or via Gemini OCR) and save chunks.
    try {
      const result = await processAndStorePDF({
        fileBuffer: buffer,
        mimeType: mimetype,
        documentId: document._id,
        userId: req.dbUser._id,
        extractedData: !isScanned ? pdfInspection : null,
        useOcr: isScanned,
        pageCountHint: pdfInspection?.pageCount || 1,
        ocrModel: resolveModelForUser(req.dbUser),
      });

      // Step 4: Update document processing information.
      document.pageCount = result.pageCount;
      document.chunkCount = result.chunkCount;
      document.status = "completed";
      document.processedAt = new Date();
      document.errorMessage = "";
    } catch (processingError) {
      console.error("Document processing error:", processingError);

      // Remove any chunks if processing was unsuccessful.
      await DocumentChunk.deleteMany({
        document: document._id,
      });

      document.status = "failed";
      document.errorMessage =
        processingError.message || "Document processing failed.";
    }

    // Step 5: Save updated document information.
    await document.save();

    const documentResponse = document.toObject();
    documentResponse.storageUrl = getDocumentDownloadUrl(documentResponse);

    res.status(201).json({
      success: true,
      message:
        document.status === "completed"
          ? isScanned
            ? "Scanned document uploaded and OCR processed successfully."
            : "PDF uploaded and processed successfully."
          : "Document uploaded, but text processing failed.",
      document: documentResponse,
    });
  } catch (error) {
    console.error("Document upload error:", error);

    // Clean up Cloudinary if the MongoDB document
    // could not be created.
    if (uploadedFile && !document) {
      try {
        await cloudinary.uploader.destroy(uploadedFile.public_id, {
          resource_type: uploadedFile.storageResourceType || "raw",
          type: "authenticated",
        });
      } catch (cleanupError) {
        console.error("Cloudinary cleanup error:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Unable to upload document. Please try again.",
    });
  }
};

// DELETE /api/documents/:id
// Delete document from Cloudinary, MongoDB, its chunks, and related chats/messages
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID.",
      });
    }

    const document = await Document.findOne({
      _id: id,
      user: req.dbUser._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // 1. Delete file from Cloudinary
    await deleteDocumentFromCloudinary(document);

    // 2. Delete all associated document chunks
    const chunkDeleteResult = await DocumentChunk.deleteMany({
      document: document._id,
      user: req.dbUser._id,
    });

    // 3. Delete all chats associated with this document and their messages
    const relatedChats = await Chat.find({
      document: document._id,
      user: req.dbUser._id,
    })
      .select("_id")
      .lean();

    const chatIds = relatedChats.map((chat) => chat._id);

    if (chatIds.length > 0) {
      await Message.deleteMany({ chat: { $in: chatIds } });
      await Chat.deleteMany({
        _id: { $in: chatIds },
        user: req.dbUser._id,
      });
    }

    // Remove dangling source references to this document in remaining user chats
    const remainingUserChatIds = await Chat.find({
      user: req.dbUser._id,
    }).distinct("_id");

    if (remainingUserChatIds.length > 0) {
      await Message.updateMany(
        {
          chat: { $in: remainingUserChatIds },
          "sources.document": document._id,
        },
        {
          $pull: {
            sources: { document: document._id },
          },
        }
      );
    }

    // 4. Delete the document record from MongoDB
    await Document.deleteOne({
      _id: document._id,
      user: req.dbUser._id,
    });

    res.status(200).json({
      success: true,
      message: "Document and related data deleted successfully.",
      deletedDocumentId: document._id,
      deletedChunksCount: chunkDeleteResult.deletedCount || 0,
      deletedChatsCount: chatIds.length,
    });
  } catch (error) {
    console.error("Delete document error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete document. Please try again.",
    });
  }
};
