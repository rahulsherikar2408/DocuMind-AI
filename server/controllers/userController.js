export const getCurrentUser = async(req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully.",
            user: req.dbUser,
        });
    } catch (error) {
        console.error("Get user error:", error);
        
        res.status(500).json({
            success: false,
            message: "Unable to retrieve user profile.",
        });
    }
};