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

/**
 * Generate an embedding vector for a user's question.
 */
const generateQueryEmbedding = async(question) => {
  try {
    if(typeof question !== "string" || !question.trim()) {
      throw new Error("A valid question is required.");
    }

    const response = await genAI.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: question.trim(),
      config: {
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    const embedding = response.embeddings?.[0]?.values;

    if(!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error("Invalid query embedding response from Gemini.");
    }

    return embedding;
  } catch (error) {
    console.error("Query embedding generation error:", error.message);
    throw error;
  }
};

export {
  generateDocumentEmbeddings,
  generateQueryEmbedding,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
};