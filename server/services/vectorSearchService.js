import mongoose from "mongoose";

import DocumentChunk from "../models/DocumentChunk.js";
import { generateQueryEmbedding } from "./embeddingService.js";

const VECTOR_INDEX_NAME = "document_chunks_vector_index";

/**
 * Search document chunks using semantic similarity.
 */
const searchSimilarChunks = async ({
  question,
  userId,
  documentId,
  limit = 5,
}) => {
  try {
    // 1. Validate input.
    if (!question || typeof question !== "string" || !question.trim()) {
      throw new Error("A valid question is required.");
    }

    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID.");
    }

    if (documentId && !mongoose.isValidObjectId(documentId)) {
      throw new Error("Invalid document ID.");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      throw new Error("Limit must be between 1 and 20.");
    }

    // 2. Generate the question embedding.
    const queryEmbedding = await generateQueryEmbedding(question);

    // 3. Convert IDs into MongoDB ObjectIds.
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 4. Build the search filter.
    const filters = [
      { user: userObjectId },
    ];

    if (documentId) {
      filters.push({
        document: new mongoose.Types.ObjectId(documentId),
      });
    }

    // 5. Perform MongoDB Vector Search.
    const results = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: VECTOR_INDEX_NAME,
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: Math.max(100, limit * 20),
          limit,
          filter: {
            $and: filters,
          },
        },
      },

      // 6. Return only the required fields.
      {
        $project: {
          _id: 1,
          document: 1,
          chunkIndex: 1,
          pageNumber: 1,
          text: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    return results;

  } catch (error) {
    console.error("Vector search error:", error.message);
    throw error;
  }
};

export default searchSimilarChunks;
