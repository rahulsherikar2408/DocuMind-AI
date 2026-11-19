import mongoose from "mongoose";

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import connectDB from "./config/db.js";
import DocumentChunk from "./models/DocumentChunk.js";
import searchSimilarChunks from "./services/vectorSearchService.js";

const testVectorSearch = async () => {
  try {
    console.log("\nConnecting to MongoDB...");
    await connectDB();

    // 1. Find an existing chunk with an embedding.
    const sampleChunk = await DocumentChunk.findOne({
      embedding: { $exists: true, $ne: [] },
    }).sort({ createdAt: -1 });

    if (!sampleChunk) {
      throw new Error(
        "No embedded document chunks found. Upload a new PDF first."
      );
    }

    if (sampleChunk.embedding.length !== 768) {
      throw new Error("The stored embedding does not contain 768 dimensions.");
    }

    console.log("\nDocument chunk found successfully!");
    console.log("Document ID:", sampleChunk.document);
    console.log("User ID:", sampleChunk.user);
    console.log("Embedding dimensions:", sampleChunk.embedding.length);

    // 2. Define a test question.
    const question = "What is the main topic discussed in this document?";

    console.log("\nSearching for:", question);

    // 3. Perform Vector Search.
    const results = await searchSimilarChunks({
      question,
      userId: sampleChunk.user.toString(),
      documentId: sampleChunk.document.toString(),
      limit: 5,
    });

    // 4. Display search results.
    console.log("\n========== VECTOR SEARCH RESULTS ==========");

    if (results.length === 0) {
      console.log("\nNo matching chunks found.");
    } else {
      console.log("\nNumber of results:", results.length);

      results.forEach((result, index) => {
        console.log(`\nResult ${index + 1}`);
        console.log("Page Number:", result.pageNumber);
        console.log("Chunk Index:", result.chunkIndex);
        console.log("Similarity Score:", result.score);
        console.log("Text:", result.text.slice(0, 300), "...");
      });
    }

    console.log("\n========== VECTOR SEARCH TEST COMPLETED ==========");

  } catch (error) {
    console.error("\nVector Search Test Failed:");
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB connection closed.");
  }
};

testVectorSearch();
