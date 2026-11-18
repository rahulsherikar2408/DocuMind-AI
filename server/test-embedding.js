import {
  generateDocumentEmbedding,
  EMBEDDING_DIMENSIONS,
} from "./services/embeddingService.js";

const testEmbedding = async () => {
  try {
    const sampleText = `
      Machine learning is a branch of artificial intelligence
      that enables computers to learn from data and make predictions.
    `;

    console.log("\nGenerating Gemini Embedding...");

    const embedding = await generateDocumentEmbedding(sampleText);

    console.log("\nEmbedding Generated Successfully!");

    console.log("\nEmbedding Dimensions:", embedding.length);

    console.log("\nFirst 5 Values:");
    console.log(embedding.slice(0, 5));

    console.log(
      "\nExpected Dimensions:",
      EMBEDDING_DIMENSIONS
    );

    console.log("\nEmbedding Test Completed!");

  } catch (error) {
    console.error("\nEmbedding Test Failed:");
    console.error(error.message);
  }
};

testEmbedding();
