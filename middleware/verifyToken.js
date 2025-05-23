require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  // Try to get token from Authorization header
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback: Try to get from cookies
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
    }

    req.userId = decoded.user_id;
    next();
  } catch (error) {
    console.log("Error in verifyToken:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized - invalid or expired token" });
  }
};
