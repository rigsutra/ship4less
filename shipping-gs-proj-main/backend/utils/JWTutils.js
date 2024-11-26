const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
  };

  const options = {
    expiresIn: "1h", // Token expires in 1 hour
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

module.exports = { generateToken };
