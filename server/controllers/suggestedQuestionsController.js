
import mongoose from "mongoose";

import Document from "../models/Document.js";
import generateSuggestedQuestions from "../services/suggestedQuestionsService.js";

export const getSuggestedQuestions = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const userId = req.dbUser._id;

        // Validate document ID
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid document ID.",
            });
        }

        // Verify document ownership and processing status
        const document = await Document.findOne({
            _id: documentId,
            user: userId,
            status: "completed",
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Completed document not found.",
            });
        }

        // Generate suggested questions
        const questions = await generateSuggestedQuestions(
            document._id,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Suggested questions generated successfully.",
            questions,
        });

    } catch (error) {
        next(error);
    }
};
