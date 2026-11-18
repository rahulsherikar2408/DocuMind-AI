import genAI from "../config/gemini.js";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

/**
 * Generate an embedding vector for document text.
 */
const generateDocumentEmbedding = async(text) => {
    try {
        if(!text || typeof text !== "string" || !text.trim()) {
            throw new Error("Text is required to generate an embedding.");
        }

        const response = await genAI.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
            config: {
                taskType: "RETRIEVAL_DOCUMENT",
                outputDimensionality: EMBEDDING_DIMENSIONS,
            },
        });

        const embedding = response.embeddings?.[0]?.values;

        if(!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
            throw new Error("Invalid embedding response from Gemini.");
        }

        return embedding;
    } catch (error) {
        console.error("Embedding generation error:", error.message);
        throw error;
    }
};

export {
    generateDocumentEmbedding,
    EMBEDDING_MODEL,
    EMBEDDING_DIMENSIONS,
};