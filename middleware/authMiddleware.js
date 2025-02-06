const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const Admin = require('../models/adminModel.js');
// const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       // Get token from header
//       token = req.headers.authorization.split(' ')[1];

//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Get user from the token
//       req.user = await User.findById(decoded.id).select('-password');

//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };
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

const isAdmin = async (req, res, next) => {
  const adminId = req.headers["admin-id"]; 

  if (!adminId) {
      return res.status(403).json({ message: "Admin ID is required in headers" });
  }

  try {
      const admin = await Admin.findById(adminId);

      if (!admin) {
          return res.status(403).json({ message: "Not authorized as an admin" });
      }

      req.admin = admin;
      next();
  } catch (error) {
      console.error("Error in isAdmin middleware:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { protect, isAdmin };