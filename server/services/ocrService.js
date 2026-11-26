import genAI from "../config/gemini.js";

const DEFAULT_OCR_MODEL = "gemini-3.1-flash-lite";

/**
 * Parse page-marked OCR output (===PAGE N===) into structured pages.
 */
const parseOcrPages = (rawText, pageCountHint = 1) => {
  const cleaned = (rawText || "").trim();

  if (!cleaned) {
    return [];
  }

  const markerRegex = /===PAGE\s+(\d+)===/gi;
  const matches = [...cleaned.matchAll(markerRegex)];

  if (matches.length === 0) {
    return [
      {
        pageNumber: 1,
        text: cleaned,
      },
    ];
  }

  const pages = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const pageNumber = parseInt(match[1], 10) || i + 1;
    const startIndex = match.index + match[0].length;
    const endIndex =
      i + 1 < matches.length ? matches[i + 1].index : cleaned.length;

    const pageText = cleaned.slice(startIndex, endIndex).trim();

    if (pageText) {
      pages.push({
        pageNumber,
        text: pageText,
      });
    }
  }

  if (pages.length === 0) {
    return [
      {
        pageNumber: 1,
        text: cleaned,
      },
    ];
  }

  if (pageCountHint && pages.length > pageCountHint) {
    return pages.slice(0, pageCountHint);
  }

  return pages;
};

/**
 * Extract readable text from scanned PDFs or images using Gemini Vision OCR.
 */
const extractTextWithOCR = async ({
  fileBuffer,
  mimeType = "application/pdf",
  pageCountHint = 1,
  model = DEFAULT_OCR_MODEL,
}) => {
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
    throw new Error("Invalid or empty file buffer for OCR.");
  }

  const activeModel = model || DEFAULT_OCR_MODEL;
  const isImage = mimeType.startsWith("image/");

  const prompt = isImage
    ? `Perform high-accuracy OCR on this scanned document image.
Extract ALL readable text accurately and completely.
Preserve headings, paragraphs, lists, and table values as clean plain text.
Do not add explanations, introductions, or markdown code fences.
If there is no readable text in the image, return an empty string.`
    : `Perform high-accuracy OCR on this scanned PDF document (${pageCountHint || "multiple"} pages).
Extract ALL readable text from every page in sequential order.
Prefix each page strictly with a marker on its own line in this exact format:
===PAGE 1===
<extracted text from page 1>
===PAGE 2===
<extracted text from page 2>

Preserve headings, paragraphs, lists, and table values cleanly.
Do not add explanations, introductions, or markdown code fences.`;

  const response = await genAI.models.generateContent({
    model: activeModel,
    contents: [
      {
        inlineData: {
          mimeType,
          data: fileBuffer.toString("base64"),
        },
      },
      prompt,
    ],
  });

  const rawText = response.text?.trim() || "";

  if (!rawText) {
    throw new Error(
      "OCR could not extract any readable text from this scanned document."
    );
  }

  const pages = isImage
    ? [{ pageNumber: 1, text: rawText }]
    : parseOcrPages(rawText, pageCountHint);

  const fullText = pages
    .map((page) => page.text)
    .filter(Boolean)
    .join("\n\n");

  if (!fullText.trim()) {
    throw new Error(
      "OCR could not extract any readable text from this scanned document."
    );
  }

  return {
    pageCount: isImage ? 1 : pageCountHint || pages.length,
    fullText,
    pages,
  };
};

export default extractTextWithOCR;
