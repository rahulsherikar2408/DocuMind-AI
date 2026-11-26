import multer from "multer";
import path from "node:path";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

// Store files temporarily in memory
const storage = multer.memoryStorage();

// Configure Multer
const upload = multer({
  storage,

  // Maximum file size: 10 MB
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  // Allow PDF and scanned image files
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return cb(
        new Error(
          "Only PDF and scanned image files (PNG, JPG, JPEG, WEBP) are allowed."
        )
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file type. Please upload a PDF or a scanned image (PNG, JPG, WEBP)."
        )
      );
    }

    cb(null, true);
  },
});

export default upload;
