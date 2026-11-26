const MAX_FILE_SIZE = 10 * 1024 * 1024;

const isValidImageSignature = (buffer, mimeType) => {
  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
};

const validatePDF = (req, res, next) => {
  try {
    const file = req.file;

    // Check whether a file was uploaded
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document file to upload.",
      });
    }

    // Reject empty files
    if (!file.buffer || file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is empty.",
      });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        success: false,
        message: "File size cannot exceed 10 MB.",
      });
    }

    if (file.mimetype === "application/pdf") {
      // Check actual PDF signature within the first 1024 bytes
      const header = file.buffer.subarray(0, 1024);

      if (!header.includes(Buffer.from("%PDF-"))) {
        return res.status(400).json({
          success: false,
          message: "Invalid PDF file. Please upload a valid PDF.",
        });
      }
    } else if (file.mimetype.startsWith("image/")) {
      if (!isValidImageSignature(file.buffer, file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file. Please upload a valid PNG, JPG, or WEBP image.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file format.",
      });
    }

    next();
  } catch (error) {
    console.error("Document validation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to validate the uploaded file.",
    });
  }
};

export default validatePDF;
