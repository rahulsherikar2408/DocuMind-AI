
import extractPDFText from "./pdfService.js";
import chunkPDFPages from "./chunkingService.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { generateDocumentEmbeddings } from "./embeddingService.js";

const processAndStorePDF = async ({ fileBuffer, documentId, userId }) => {
  // 1. Extract text from the PDF.
  const extractedData = await extractPDFText(fileBuffer);

  // 2. Split the extracted text into chunks.
  const chunks = chunkPDFPages(extractedData.pages);

  if (chunks.length === 0) {
    throw new Error("No text chunks were generated from the PDF.");
  }

  // 3. Generate embeddings in batches.
  // Keep batches small to avoid sending too much text in one request.
  const BATCH_SIZE = 20;
  const chunkDocuments = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const embeddings = await generateDocumentEmbeddings(
      batch.map((chunk) => chunk.text)
    );

    // 4. Combine each chunk with its corresponding embedding.
    batch.forEach((chunk, index) => {
      chunkDocuments.push({
        document: documentId,
        user: userId,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        text: chunk.text,
        characterCount: chunk.characterCount,
        embedding: embeddings[index],
      });
    });
  }

  // 5. Save chunks and embeddings in MongoDB.
  await DocumentChunk.insertMany(chunkDocuments);

  return {
    pageCount: extractedData.pageCount,
    chunkCount: chunkDocuments.length,
  };
};

export default processAndStorePDF;