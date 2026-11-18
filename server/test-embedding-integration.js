import {
  generateDocumentEmbeddings,
  generateQueryEmbedding,
  EMBEDDING_DIMENSIONS,
} from "./services/embeddingService.js";

// Calculate cosine similarity between two vectors.
const cosineSimilarity = (vectorA, vectorB) => {
  const dotProduct = vectorA.reduce(
    (sum, value, index) => sum + value * vectorB[index],
    0
  );

  const magnitudeA = Math.sqrt(
    vectorA.reduce((sum, value) => sum + value * value, 0)
  );

  const magnitudeB = Math.sqrt(
    vectorB.reduce((sum, value) => sum + value * value, 0)
  );

  return dotProduct / (magnitudeA * magnitudeB);
};

const testEmbeddingIntegration = async () => {
  try {
    // Sample document chunks.
    const documentChunks = [
      "Supervised learning is a machine learning technique that uses labeled training data.",
      "Unsupervised learning identifies patterns and relationships in unlabeled data.",
    ];

    // Sample user question.
    const question = "What is supervised learning?";

    console.log("\n========== GEMINI EMBEDDING INTEGRATION TEST ==========");

    // 1. Generate document embeddings.
    console.log("\n1. Generating document embeddings...");

    const documentEmbeddings = await generateDocumentEmbeddings(
      documentChunks
    );

    console.log("Document embeddings generated:", documentEmbeddings.length);

    // 2. Generate query embedding.
    console.log("\n2. Generating query embedding...");

    const queryEmbedding = await generateQueryEmbedding(question);

    console.log("Query embedding generated successfully.");

    // 3. Verify dimensions.
    console.log("\n3. Verifying embedding dimensions...");

    const allEmbeddings = [
      ...documentEmbeddings,
      queryEmbedding,
    ];

    allEmbeddings.forEach((embedding, index) => {
      if (embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(`Invalid dimensions in embedding ${index + 1}`);
      }

      console.log(
        `Embedding ${index + 1}: ${embedding.length} dimensions`
      );
    });

    // 4. Compare query with document chunks.
    console.log("\n4. Calculating similarity scores...");

    documentEmbeddings.forEach((embedding, index) => {
      const similarity = cosineSimilarity(queryEmbedding, embedding);

      console.log(
        `Chunk ${index + 1} similarity: ${similarity.toFixed(4)}`
      );
    });

    console.log("\n========== TEST COMPLETED SUCCESSFULLY ==========");

  } catch (error) {
    console.error("\nEmbedding Integration Test Failed:");
    console.error(error.message);
  }
};

testEmbeddingIntegration();