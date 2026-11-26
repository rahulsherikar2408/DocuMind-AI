import genAI from "../config/gemini.js";
import DocumentChunk from "../models/DocumentChunk.js";

const generateSuggestedQuestions = async (
    documentId,
    userId,
    model = "gemini-3.1-flash-lite"
) => {
    try {
        // Retrieve document chunks belonging to the authenticated user
        const chunks = await DocumentChunk.find({
            document: documentId,
            user: userId,
        })
            .sort({ chunkIndex: 1 })
            .limit(20)
            .select("text chunkIndex pageNumber");

        if (!chunks.length) {
            throw new Error("No extracted text found for this document.");
        }

        // Combine document text to provide context to Gemini
        const documentText = chunks
            .map((chunk) => chunk.text)
            .join("\n\n");

        // Generate suggested questions using Gemini
        const response = await genAI.interactions.create({
            model: model || "gemini-3.1-flash-lite",
            input: `
                You are an intelligent document assistant.

                Analyze the following document content and generate
                5 useful questions that a reader might want to ask
                about this document.

                Requirements:
                1. Questions must be directly related to the document.
                2. Cover different important topics.
                3. Include questions about key concepts, findings,
                   explanations, or conclusions where relevant.
                4. Avoid duplicate or generic questions.
                5. Keep questions clear and concise.
                6. Do not answer the questions.

                Return ONLY a valid JSON array of strings.

                Example:
                [
                    "What are the main objectives of this document?",
                    "Which important concepts are discussed?",
                    "What are the key findings?"
                ]

                Document content:
                ${documentText}
            `,
        });

        const output = response.output_text?.trim();

        if (!output) {
            throw new Error("Gemini returned empty suggested questions.");
        }

        // Extract JSON array even if Gemini includes markdown or introductory text
        let cleanedOutput = output.trim();
        const startIdx = cleanedOutput.indexOf("[");
        const endIdx = cleanedOutput.lastIndexOf("]");

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            cleanedOutput = cleanedOutput.substring(startIdx, endIdx + 1);
        } else {
            cleanedOutput = cleanedOutput
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/, "")
                .trim();
        }

        // Parse Gemini response into an array
        const questions = JSON.parse(cleanedOutput);

        if (
            !Array.isArray(questions) ||
            questions.length === 0 ||
            !questions.every(
                (question) =>
                    typeof question === "string" &&
                    question.trim().length > 0
            )
        ) {
            throw new Error("Gemini returned an invalid questions format.");
        }

        return questions.map((question) => question.trim());

    } catch (error) {
        console.error("Suggested Questions Error:", error.message);
        throw error;
    }
};

export default generateSuggestedQuestions;
