import mongoose from "mongoose";

import Document from "../models/Document.js";
import uploadPDFToCloudinary from "../services/cloudinaryService.js";


// Get all documents belonging to the logged-in user
export const getDocuments = async(req, res) => {
    try {
        const documents = await Document.find({
            user: req.dbUser._id,
        }).sort({ createAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            documents,
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

        res.status(200).json({
            success: true,
            document,
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
    try {
        const { buffer, originalname, mimetype, size } = req.file;

        // Upload PDF to Cloudinary
        const result = await uploadPDFToCloudinary(
            buffer,
            originalname
        );

        // Return uploaded file details
        res.status(201).json({
            success: true,
            message: "PDF uploaded to Cloudinary successfully.",
            file: {
                fileName: originalname,
                fileSize: size,
                mimeType: mimetype,
                storageProvider: "cloudinary",
                storageUrl: result.secure_url,
                storageKey: result.public_id,
                resourceType: result.resource_type,
                format: result.format,
            },
        });
    } catch (error) {
        console.error("Document upload error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to upload document. Please try again.",
        });
    }
};