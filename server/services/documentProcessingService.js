import extractPDFText from "./pdfService.js";
import extractTextWithOCR from "./ocrService.js";
import chunkPDFPages from "./chunkingService.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { generateDocumentEmbeddings } from "./embeddingService.js";

const processAndStorePDF = async ({
  fileBuffer,
  mimeType = "application/pdf",
  documentId,
  userId,
  extractedData = null,
  useOcr = false,
  pageCountHint = 1,
  ocrModel = "gemini-3.1-flash-lite",
}) => {
  // 1. Obtain extracted pages via pre-inspected text, OCR, or PDF text parser.
  let resolvedData = extractedData;

  if (!resolvedData) {
    if (useOcr || mimeType.startsWith("image/")) {
      resolvedData = await extractTextWithOCR({
        fileBuffer,
        mimeType,
        pageCountHint,
        model: ocrModel,
      });
    } else {
      resolvedData = await extractPDFText(fileBuffer);
    }
  }

  // 2. Split the extracted text into chunks.
  const chunks = chunkPDFPages(resolvedData.pages);

  if (chunks.length === 0) {
    throw new Error("No text chunks were generated from the document.");
  }

  // 3. Generate embeddings in batches.
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
    pageCount: resolvedData.pageCount,
    chunkCount: chunkDocuments.length,
  };
};

export default processAndStorePDF;
