import mongoose from "mongoose";

import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";

import cloudinary from "../config/cloudinary.js";
import uploadPDFToCloudinary from "../services/cloudinaryService.js";
import processAndStorePDF from "../services/documentProcessingService.js";

export const getDocumentDownloadUrl = (doc) => {
    if (!doc) return "";

    if (doc.storageProvider === "cloudinary" || !doc.storageProvider) {
        let publicId = doc.storageKey;
        let cldType = "authenticated";

        if (doc.storageUrl) {
            if (doc.storageUrl.includes("/raw/upload/")) {
                cldType = "upload";
            }
            if (!publicId) {
                const match = doc.storageUrl.match(/\/raw\/(?:authenticated|upload)\/(?:v\d+\/)?(.+?)(?:\?.*)?$/);
                if (match) {
                    publicId = match[1];
                }
            }
        }

        if (publicId) {
            try {
                return cloudinary.utils.private_download_url(
                    publicId,
                    "",
                    {
                        resource_type: "raw",
                        type: cldType,
                    }
                );
            } catch (err) {
                console.error("Error generating Cloudinary download URL:", err);
            }
        }
    }

    return doc.storageUrl || "";
};

// Get all documents belonging to the logged-in user
export const getDocuments = async(req, res) => {
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
export const getDocumentById = async(req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB document ID
        if(!mongoose.isValidObjectId(id)) {
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

        if(!document) {
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

export const uploadDocument = async(req, res) => {
    let uploadedFile;
    let document;

    try {
        const { buffer, originalname, mimetype, size } = req.file;

        // Step 1: Upload PDF to Cloudinary
        uploadedFile = await uploadPDFToCloudinary(
            buffer,
            originalname
        );

        // Step 2: Create document record.
        document = await Document.create({
            user: req.dbUser._id,
            fileName: originalname,
            fileSize: size,
            mimeType: mimetype,
            pageCount: 0,
            chunkCount: 0,
            storageProvider: "cloudinary",
            storageUrl: uploadedFile.secure_url,
            storageKey: uploadedFile.public_id,
            status: "processing",
        });

        // Step 3: Extract PDF text and save chunks.
        try {
            const result = await processAndStorePDF({
                fileBuffer: buffer,
                documentId: document._id,
                userId: req.dbUser._id,
            });

            // Step 4: Update document processing information.
            document.pageCount = result.pageCount;
            document.chunkCount = result.chunkCount;
            document.status = "completed";
            document.processedAt = new Date();
            document.errorMessage = "";

        } catch (processingError) {
            console.error("PDF processing error:", processingError);

            // Remove any chunks if processing was unsuccessful.
            await DocumentChunk.deleteMany({
                document: document._id,
            });

            document.status = "failed";
            document.errorMessage = processingError.message || "PDF processing failed.";
        }

        // Step 5: Save updated document information.
        await document.save();

        const documentResponse = document.toObject();
        documentResponse.storageUrl = getDocumentDownloadUrl(documentResponse);

        res.status(201).json({
            success: true,
            message: document.status === "completed"
                        ? "PDF uploaded and processed successfully."
                        : "PDF uploaded, but text processing failed.",
            document: documentResponse,
        });

    } catch (error) {
        console.error("Document upload error:", error);

        // Clean up Cloudinary if the MongoDB document
        // could not be created.
        if(uploadedFile && !document) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedFile.public_id,
                    {
                        resource_type: "raw",
                        type: "authenticated",
                    }
                );
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