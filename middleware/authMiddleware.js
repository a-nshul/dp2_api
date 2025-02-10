const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const Admin = require('../models/adminModel.js');
const protect = async (req, res, next) => {
  console.log("Authorization Header:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      // Decode the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // This should print { id: 'adminUserId', iat: ..., exp: ... }

      // Find user by decoded ID
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("User not found in DB for ID:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ message: "API Key is required" });
  }

  const user = await User.findOne({ apiKey, active: true });

  if (!user) {
    return res.status(403).json({ message: "Invalid API Key" });
  }

  req.user = user;
  next();
};

module.exports = { protect ,authenticateApiKey};