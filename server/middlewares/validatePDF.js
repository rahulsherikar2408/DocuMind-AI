const MAX_FILE_SIZE = 10 * 1024 * 1024;

const validatePDF = (req, res, next) => {
  try {
    const file = req.file;

    // Check whether a file was uploaded
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF file to upload.",
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

    // Check actual PDF signature within the first 1024 bytes
    const header = file.buffer.subarray(0, 1024);

    if(!header.includes(Buffer.from("%PDF-"))) {
        return res.status(400).json({
            success: false,
            message: "Invalid PDF file. Please upload a valid PDF.",
        });
    }

    next();
  } catch (error) {
    console.error("PDF validation error:", error);

    res.status(500).json({
        success: false,
        message: "Unable to validate the uploaded file.",
    });
  }
};

export default validatePDF;