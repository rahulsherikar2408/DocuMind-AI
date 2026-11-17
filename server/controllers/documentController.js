import mongoose from "mongoose";

import Document from "../models/Document.js";
import uploadPDFToCloudinary from "../services/cloudinaryService.js";
import cloudinary from "../config/cloudinary.js";

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
    let uploadedFile = null;

    try {
        const { buffer, originalname, mimetype, size } = req.file;

        // 1. Upload PDF to Cloudinary
        const uploadedFile = await uploadPDFToCloudinary(
            buffer,
            originalname
        );

        // 2. Save document metadata in MongoDB
        const document = await Document.create({
            user: req.dbUser._id,
            fileName: originalname,
            fileSize: size,
            mimeType: mimetype,
            pageCount: 0,
            storageProvider: "cloudinary",
            storageUrl: uploadedFile.secure_url,
            storageKey: uploadedFile.public_id,
            status: "pending",
        });

        // 3. Return the saved document
        res.status(201).json({
            success: true,
            message: "Document uploaded and saved successfully.",
            document,
        });
    } catch (error) {
        console.error("Document upload error:", error);

        // 4. Remove the Clouinary file if MongoDB saving failed
        if(uploadedFile?.public_id) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedFile.public_id,
                    {
                        resource_type: "raw",
                        type: "authenticated",
                    }
                );

                console.log("Orphaned Cloudinary file removed.");
            } catch (cleanupError) {
                console.error("Cloudinary cleanup failed:", cleanupError.message);
            }
        }
        
        res.status(500).json({
            success: false,
            message: "Unable to upload document. Please try again.",
        });
    }
};