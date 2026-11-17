
import { readFile } from "node:fs/promises";

import extractPDFText from "./services/pdfService.js";
import chunkPDFPages from "./services/chunkingService.js";

const testChunking = async () => {
  try {
    // Read the sample PDF
    const fileBuffer = await readFile("./test-files/sample.pdf");

    // Extract text page by page
    const extractedData = await extractPDFText(fileBuffer);

    // Split extracted text into chunks
    const chunks = chunkPDFPages(extractedData.pages);

    console.log("\nPDF Chunking Successful!");

    console.log("\nTotal Pages:", extractedData.pageCount);
    console.log("Total Chunks:", chunks.length);

    chunks.forEach((chunk) => {
      console.log(`\n--- Chunk ${chunk.chunkIndex} ---`);
      console.log("Page Number:", chunk.pageNumber);
      console.log("Character Count:", chunk.characterCount);
      console.log("Text:", chunk.text);
    });
  } catch (error) {
    console.error("\nChunking Failed:");
    console.error(error.message);
  }
};

testChunking();
