import {
  generateQueryEmbedding,
  EMBEDDING_DIMENSIONS,
} from "./services/embeddingService.js";

const testQueryEmbedding = async () => {
  try {
    const question = "What is supervised learning?";

    console.log("\nGenerating Query Embedding...");
    console.log("Question:", question);

    const embedding = await generateQueryEmbedding(question);

    console.log("\nQuery Embedding Generated Successfully!");
    console.log("Embedding Dimensions:", embedding.length);
    console.log("First 5 Values:", embedding.slice(0, 5));
    console.log("Expected Dimensions:", EMBEDDING_DIMENSIONS);

    console.log("\nQuery Embedding Test Completed!");
  } catch (error) {
    console.error("\nQuery Embedding Test Failed:");
    console.error(error.message);
  }
};

testQueryEmbedding();
