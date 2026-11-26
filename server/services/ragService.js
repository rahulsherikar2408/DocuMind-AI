import searchSimilarChunks from "./vectorSearchService.js";
import generateDocumentAnswer from "./answerGenerationService.js";

/**
 * Complete Retrieval-Augmented Generation pipeline.
 */
const generateRAGResponse = async ({
  question,
  userId,
  documentId,
  model = "gemini-3.1-flash-lite",
}) => {
  try {
    // 1. Validate the question.
    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      throw new Error("A valid question is required.");
    }

    if (!userId) {
      throw new Error("User ID is required.");
    }

    console.log("\nStarting RAG pipeline...");

    // 2. Retrieve relevant chunks from MongoDB.
    console.log("\nSearching relevant document chunks...");

    const relevantChunks = await searchSimilarChunks({
      question: question.trim(),
      userId,
      documentId,
      limit: 5,
    });

    console.log("Retrieved chunks:", relevantChunks.length);

    // 3. Handle cases where no chunks are found.
    if (relevantChunks.length === 0) {
      return {
        answer:
          "I couldn't find relevant information in your uploaded documents to answer this question.",
        sources: [],
        model,
      };
    }

    // 4. Generate an answer using retrieved context.
    console.log("\nGenerating AI answer...");

    const response = await generateDocumentAnswer({
      question: question.trim(),
      chunks: relevantChunks,
      model,
    });

    console.log("\nRAG response generated successfully!");

    // 5. Return the final response.
    return {
      question: question.trim(),
      answer: response.answer,
      sources: response.sources,
      model: response.model,
    };

  } catch (error) {
    console.error("RAG pipeline error:", error.message);
    throw error;
  }
};

export default generateRAGResponse;
