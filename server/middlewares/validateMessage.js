const validateMessage = (req, res, next) => {
  const { content } = req.body;

  if (typeof content !== "string") {
    return res.status(400).json({
      success: false,
      message: "Message content must be a string.",
    });
  }

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return res.status(400).json({
      success: false,
      message: "Message cannot be empty.",
    });
  }

  if (trimmedContent.length > 5000) {
    return res.status(400).json({
      success: false,
      message: "Message cannot exceed 5000 characters.",
    });
  }

  req.body.content = trimmedContent;

  next();
};

export default validateMessage;