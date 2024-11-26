const jwt = require("jsonwebtoken");

// Middleware for Authentication
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please log in again.",
        });
      }
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Attach user data to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Middleware for Role-Based Authorization
const authorize = (role) => (req, res, next) => {
  if (req.userRole !== role) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};

module.exports = { authMiddleware, authorize };
