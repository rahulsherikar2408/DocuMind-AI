import multer from "multer";

// Store uploaded files in memory
const storage = multer.memoryStorage();

// Configure Multer
const upload = multer({
    storage,

    // Maximum file size: 10 MB
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
    },
    
    // Allow PDF files only
    fileFilter: (req, file, cb) => {
        if(file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed."));
        }
    
        cb(null, true);
    },
});

export default upload;