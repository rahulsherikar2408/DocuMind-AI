
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Split a page's text into smaller overlapping chunks.
 */
const splitTextIntoChunks = (
  text,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP
) => {
  if (typeof text !== "string") {
    throw new Error("Text must be a string.");
  }

  if (
    !Number.isInteger(chunkSize) ||
    !Number.isInteger(overlap) ||
    chunkSize <= 0 ||
    overlap < 0 ||
    overlap >= chunkSize
  ) {
    throw new Error("Invalid chunk size or overlap.");
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    // Prefer ending at a word boundary.
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);

      if (lastSpace > start + chunkSize * 0.7) {
        end = lastSpace;
      }
    }

    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    // Move backwards to create overlap with the previous chunk.
    let nextStart = Math.max(start + 1, end - overlap);

    // Avoid starting in the middle of a word.
    const nextSpace = text.indexOf(" ", nextStart);

    if (nextSpace !== -1 && nextSpace < end) {
      nextStart = nextSpace + 1;
    }

    start = nextStart;
  }

  return chunks;
};

/**
 * Split every PDF page independently.
 * This preserves the original page number for every chunk.
 */
const chunkPDFPages = (
  pages,
  options = {}
) => {
  if (!Array.isArray(pages)) {
    throw new Error("Pages must be an array.");
  }

  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_CHUNK_OVERLAP;

  const allChunks = [];

  pages.forEach((page) => {
    if (
      !page ||
      !Number.isInteger(page.pageNumber) ||
      typeof page.text !== "string"
    ) {
      throw new Error("Invalid PDF page data.");
    }

    const pageChunks = splitTextIntoChunks(
      page.text,
      chunkSize,
      overlap
    );

    pageChunks.forEach((chunkText) => {
      allChunks.push({
        chunkIndex: allChunks.length,
        pageNumber: page.pageNumber,
        text: chunkText,
        characterCount: chunkText.length,
      });
    });
  });

  return allChunks;
};

export default chunkPDFPages;