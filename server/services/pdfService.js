import { PDFParse } from "pdf-parse";

/**
 * Inspect a PDF buffer and extract embedded text if present.
 * Returns isScanned=true when no meaningful embedded text is found.
 */
export const inspectPDFText = async (fileBuffer) => {
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
    throw new Error("Invalid or empty PDF buffer.");
  }

  const parser = new PDFParse({
    data: fileBuffer,
  });

  try {
    const result = await parser.getText();

    const pages = (result.pages || []).map((page) => ({
      pageNumber: page.num,
      text: (page.text || "").trim(),
    }));

    const fullText = pages
      .map((page) => page.text)
      .filter(Boolean)
      .join("\n\n");

    const meaningfulChars = fullText.replace(/\s+/g, "").length;
    const isScanned = meaningfulChars === 0;

    return {
      pageCount: result.total || pages.length || 1,
      fullText,
      pages,
      isScanned,
    };
  } finally {
    await parser.destroy();
  }
};

/**
 * Extract text from a PDF buffer.
 * Preserves the original PDF page numbers.
 */
const extractPDFText = async (fileBuffer) => {
  const inspection = await inspectPDFText(fileBuffer);

  if (inspection.isScanned) {
    throw new Error(
      "No extractable text found. This PDF may contain scanned images."
    );
  }

  return {
    pageCount: inspection.pageCount,
    fullText: inspection.fullText,
    pages: inspection.pages,
  };
};

export default extractPDFText;
