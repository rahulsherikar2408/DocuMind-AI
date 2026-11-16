import multer from "multer";
import path from "node:path";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
    
    // Allow PDF files only
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if(extension !== ".pdf") {
            return cb(new Error("Only PDF files are allowed."));
        }

        // Validate MIME type
        if(file.mimetype !== "application/pdf") {
            return cb(new Error("Invalid file type. Please upload a PDF."));
        }
    
        cb(null, true);
    },
});

export default upload;