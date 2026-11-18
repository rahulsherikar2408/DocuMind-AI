
import {
  generateDocumentEmbeddings,
  EMBEDDING_DIMENSIONS,
} from "./services/embeddingService.js";

const testEmbedding = async () => {
  try {
    const sampleTexts = [
      "Machine learning enables computers to learn from data.",
      "React is a JavaScript library for building user interfaces.",
    ];

    console.log("\nGenerating Gemini Embeddings...");

    const embeddings = await generateDocumentEmbeddings(sampleTexts);

    console.log("\nEmbeddings Generated Successfully!");
    console.log("Number of embeddings:", embeddings.length);

    embeddings.forEach((embedding, index) => {
      console.log(`\nEmbedding ${index + 1}:`);
      console.log("Dimensions:", embedding.length);
      console.log("First 5 values:", embedding.slice(0, 5));
    });

    console.log("\nExpected Dimensions:", EMBEDDING_DIMENSIONS);
    console.log("\nEmbedding Test Completed!");

  } catch (error) {
    console.error("\nEmbedding Test Failed:");
    console.error(error.message);
  }
};

testEmbedding();