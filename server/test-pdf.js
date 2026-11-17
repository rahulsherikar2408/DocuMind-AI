
import { readFile } from "node:fs/promises";
import extractPDFText from "./services/pdfService.js";

const testPDF = async () => {
  try {
    // Read the sample PDF
    const fileBuffer = await readFile(
      "./test-files/sample.pdf"
    );

    // Extract PDF text
    const result = await extractPDFText(fileBuffer);

    console.log("\nPDF Extraction Successful!");

    console.log("\nTotal Pages:", result.pageCount);

    console.log("\nExtracted Text:");
    console.log(result.fullText);

    console.log("\nPage-wise Text:");

    result.pages.forEach((page) => {
      console.log(`\n--- Page ${page.pageNumber} ---`);
      console.log(page.text);
    });

  } catch (error) {
    console.error("\nPDF Extraction Failed:");
    console.error(error.message);
  }
};

testPDF();
