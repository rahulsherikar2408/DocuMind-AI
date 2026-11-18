
import genAI from "../config/gemini.js";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

/**
 * Generate embeddings for multiple document chunks.
 */
const generateDocumentEmbeddings = async (texts) => {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("At least one text is required.");
    }

    if (texts.some((text) => typeof text !== "string" || !text.trim())) {
      throw new Error("All texts must be non-empty strings.");
    }

    const response = await genAI.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts,
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    const embeddings = response.embeddings?.map(
      (item) => item.values
    );

    if (
      !embeddings ||
      embeddings.length !== texts.length ||
      embeddings.some(
        (embedding) =>
          !embedding || embedding.length !== EMBEDDING_DIMENSIONS
      )
    ) {
      throw new Error("Invalid embedding response from Gemini.");
    }

    return embeddings;
  } catch (error) {
    console.error("Embedding generation error:", error.message);
    throw error;
  }
};

export {
  generateDocumentEmbeddings,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
};