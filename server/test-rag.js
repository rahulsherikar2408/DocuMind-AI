import mongoose from "mongoose";

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import connectDB from "./config/db.js";
import DocumentChunk from "./models/DocumentChunk.js";
import generateRAGResponse from "./services/ragService.js";

const testRAG = async () => {
  try {
    console.log("\nConnecting to MongoDB...");

    await connectDB();

    // Find a document chunk that already has an embedding.
    const sampleChunk = await DocumentChunk.findOne({
      embedding: { $exists: true, $ne: [] },
    }).sort({ createdAt: -1 });

    if (!sampleChunk) {
      throw new Error(
        "No embedded document chunks found. Upload a PDF first."
      );
    }

    // Test question.
    const question = "What is the main topic discussed in this document?";

    console.log("\nDocument ID:", sampleChunk.document);
    console.log("User ID:", sampleChunk.user);
    console.log("\nQuestion:", question);

    // Execute the complete RAG pipeline.
    const response = await generateRAGResponse({
      question,
      userId: sampleChunk.user.toString(),
      documentId: sampleChunk.document.toString(),
    });

    // Display the result.
    console.log("\n========== RAG RESPONSE ==========");

    console.log("\nQuestion:");
    console.log(response.question);

    console.log("\nAI Answer:");
    console.log(response.answer);

    console.log("\nSources:");

    response.sources.forEach((source, index) => {
      console.log(`\nSource ${index + 1}`);
      console.log("Page:", source.pageNumber);
      console.log("Chunk:", source.chunkIndex);
      console.log("Score:", source.score);
    });

    console.log("\nModel:", response.model);

    console.log("\n========== RAG TEST COMPLETED ==========");

  } catch (error) {
    console.error("\nRAG Test Failed:");
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB connection closed.");
  }
};

testRAG();
