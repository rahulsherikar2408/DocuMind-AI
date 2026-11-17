import { PDFParse } from "pdf-parse";

/**
 * Extract text from a PDF buffer.
 * Preserves the original PDF page numbers.
 */

const extractPDFText = async(fileBuffer) => {
    if(!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
        throw new Error("Invalid or empty PDF buffer.");
    }

    const parser = new PDFParse({
        data: fileBuffer,
    });

    try {
        // Extract text from all pages
        const result = await parser.getText();

        // Preserve individual page numbers and text
        const pages = result.pages.map((page) => ({
            pageNumber: page.num,
            text: page.text.trim(),
        }));

        // Combine all extracted page text
        const fullText = pages
            .map((page) => page.text)
            .filter(Boolean)
            .join("\n\n");

        // Detect scanned PDFs or PDFs without extractable text
        if(!fullText.trim()) {
            throw new Error(
                "No extractable text found. This PDF may contain scanned images."
            );
        }

        return {
            pageCount: result.total,
            fullText,
            pages,
        };
    } finally {
        // Release parser resources
        await parser.destroy();
    }
};

export default extractPDFText;