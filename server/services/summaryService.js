
import genAI from "../config/gemini.js";
import DocumentChunk from "../models/DocumentChunk.js";

const generateDocumentSummary = async (documentId, userId) => {
    try {
        // Retrieve all chunks belonging to this user's document
        const chunks = await DocumentChunk.find({
            document: documentId,
            user: userId,
        })
            .sort({ chunkIndex: 1 })
            .select("pageNumber text chunkIndex");

        if (!chunks.length) {
            throw new Error("No extracted text found for this document.");
        }

        // Combine extracted chunks into document text
        const documentText = chunks
            .map((chunk) => chunk.text)
            .join("\n\n");

        // Generate summary using Gemini
        const response = await genAI.interactions.create({
            model: "gemini-3.5-flash-lite",
            input: `
                You are a professional document summarization assistant.

                Summarize the following document in a clear and structured format.

                Include:
                1. Document overview
                2. Main topics discussed
                3. Important points
                4. Key findings or conclusions

                Use simple language.
                Avoid adding information that is not present in the document.

                Document content:
                ${documentText}
            `,
        });

        const summary = response.output_text?.trim();

        if (!summary) {
            throw new Error("Gemini returned an empty summary.");
        }

        return summary;

    } catch (error) {
        console.error("Document Summary Error:", error.message);
        throw error;
    }
};

export default generateDocumentSummary;
