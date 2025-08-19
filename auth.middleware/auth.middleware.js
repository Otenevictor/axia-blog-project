const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({ message: "Please login to access this resource" });
        }

        // Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not found in environment variables");
            return res.status(500).json({ message: "Server configuration error" });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
            if (error) {
                console.error("JWT verification error:", error.message);
                return res.status(401).json({ message: "Session expired or invalid token" });
            }
            
            // Set user data
            req.user = { 
                id: payload.id, 
                isAdmin: payload.isAdmin || false // Default to false if not specified
            };
            
            next(); // Continue to next middleware
        });
    } catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Admin authorization middleware
const adminAuth = (req, res, next) => {
    // Check if user exists (should be set by authentication middleware)
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    // Check admin privileges
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    
    next();
};

module.exports = { authentication, adminAuth };