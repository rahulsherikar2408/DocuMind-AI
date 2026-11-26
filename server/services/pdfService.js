let cachedPDFParse = null;

/**
 * Ensure browser-like geometry globals exist before loading pdf-parse / pdfjs-dist
 * in serverless environments (e.g., Vercel) where @napi-rs/canvas is unavailable.
 */
const ensurePdfPolyfills = () => {
  if (typeof globalThis.DOMMatrix === "undefined") {
    class DOMMatrixPolyfill {
      constructor(init) {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;

        if (Array.isArray(init) || ArrayBuffer.isView(init)) {
          if (init.length >= 6) {
            this.a = Number(init[0]) || 0;
            this.b = Number(init[1]) || 0;
            this.c = Number(init[2]) || 0;
            this.d = Number(init[3]) || 0;
            this.e = Number(init[4]) || 0;
            this.f = Number(init[5]) || 0;
          }
        } else if (init && typeof init === "object") {
          this.a = init.a ?? 1;
          this.b = init.b ?? 0;
          this.c = init.c ?? 0;
          this.d = init.d ?? 1;
          this.e = init.e ?? 0;
          this.f = init.f ?? 0;
        }
      }

      multiplySelf(other) {
        const m = other instanceof DOMMatrixPolyfill ? other : new DOMMatrixPolyfill(other);
        const a = this.a * m.a + this.c * m.b;
        const b = this.b * m.a + this.d * m.b;
        const c = this.a * m.c + this.c * m.d;
        const d = this.b * m.c + this.d * m.d;
        const e = this.a * m.e + this.c * m.f + this.e;
        const f = this.b * m.e + this.d * m.f + this.f;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
      }

      preMultiplySelf(other) {
        const m = other instanceof DOMMatrixPolyfill ? other : new DOMMatrixPolyfill(other);
        const a = m.a * this.a + m.c * this.b;
        const b = m.b * this.a + m.d * this.b;
        const c = m.a * this.c + m.c * this.d;
        const d = m.b * this.c + m.d * this.d;
        const e = m.a * this.e + m.c * this.f + m.e;
        const f = m.b * this.e + m.d * this.f + m.f;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
      }

      translate(tx = 0, ty = 0) {
        return new DOMMatrixPolyfill(this).multiplySelf([1, 0, 0, 1, tx, ty]);
      }

      scale(sx = 1, sy = sx) {
        return new DOMMatrixPolyfill(this).multiplySelf([sx, 0, 0, sy, 0, 0]);
      }

      invertSelf() {
        const det = this.a * this.d - this.b * this.c;
        if (!det) {
          this.a = NaN;
          this.b = NaN;
          this.c = NaN;
          this.d = NaN;
          this.e = NaN;
          this.f = NaN;
          return this;
        }
        const a = this.d / det;
        const b = -this.b / det;
        const c = -this.c / det;
        const d = this.a / det;
        const e = (this.c * this.f - this.d * this.e) / det;
        const f = (this.b * this.e - this.a * this.f) / det;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
      }
    }

    globalThis.DOMMatrix = DOMMatrixPolyfill;
  }

  if (typeof globalThis.ImageData === "undefined") {
    globalThis.ImageData = class ImageDataPolyfill {
      constructor(dataOrWidth, widthOrHeight, height) {
        if (typeof dataOrWidth === "number") {
          this.width = dataOrWidth;
          this.height = widthOrHeight;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        } else {
          this.data = dataOrWidth;
          this.width = widthOrHeight;
          this.height = height ?? (dataOrWidth.length / (4 * widthOrHeight));
        }
      }
    };
  }

  if (typeof globalThis.Path2D === "undefined") {
    globalThis.Path2D = class Path2DPolyfill {
      addPath() {}
      closePath() {}
      moveTo() {}
      lineTo() {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      ellipse() {}
      rect() {}
    };
  }
};

const getPDFParse = async () => {
  if (!cachedPDFParse) {
    ensurePdfPolyfills();
    const [mod, workerMod] = await Promise.all([
      import("pdf-parse"),
      import("pdfjs-dist/legacy/build/pdf.worker.mjs"),
    ]);
    if (!globalThis.pdfjsWorker && workerMod?.WorkerMessageHandler) {
      globalThis.pdfjsWorker = workerMod;
    }
    cachedPDFParse = mod.PDFParse;
  }
  return cachedPDFParse;
};

/**
 * Inspect a PDF buffer and extract embedded text if present.
 * Returns isScanned=true when no meaningful embedded text is found.
 */
export const inspectPDFText = async (fileBuffer) => {
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
    throw new Error("Invalid or empty PDF buffer.");
  }

  const PDFParse = await getPDFParse();
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
