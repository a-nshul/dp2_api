const User =require("../models/userModel");
const axios = require("axios");
const crypto = require("crypto");
const generateToken = require("../config/generateToken");
const mongoose = require("mongoose");
const Response = require("../models/responseModel");
// Send OTP for Signup
const signupUser = async (req, res) => {
  try {
    const { mobileno } = req.body;

    if (!mobileno) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ mobileno });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Log for debugging
    console.log("Sending OTP to:", mobileno);

    // Validate API key presence
    if (!process.env.API_Key) {
      return res.status(500).json({ message: "OTP service API key is missing" });
    }

    // Send OTP request to 2Factor API
    const otpResponse = await axios.get(
      `https://2factor.in/API/V1/${process.env.API_Key}/SMS/${mobileno}/AUTOGEN`
    );

    console.log("OTP API Response:", otpResponse.data); // Debugging log

    if (otpResponse.data.Status !== "Success") {
      return res.status(500).json({ message: "Failed to send OTP", details: otpResponse.data });
    }

    return res.status(200).json({
      message: "OTP sent successfully",
      sessionId: otpResponse.data.Details
    });
  } catch (error) {
    console.error("Error sending OTP:", error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      message: "Failed to send OTP",
      error: error.response?.data || error.message
    });
  }
};

// Verify OTP for Signup
const verifyOtp = async (req, res) => {
  try {
    const { mobileno, otp, sessionId } = req.body;

    if (!mobileno || !otp || !sessionId) {
      return res.status(400).json({ message: "Mobile number, OTP, and session ID are required" });
    }

    // Verify OTP using 2Factor API
    const verifyResponse = await axios.get(
      `https://2factor.in/API/V1/${process.env.API_Key}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (verifyResponse.data.Status !== "Success") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create new user after OTP verification
    const newUser = await User.create({ mobileno });

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Send OTP for Login
const loginUser = async (req, res) => {
  try {
    const { mobileno } = req.body;

    if (!mobileno) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    const user = await User.findOne({ mobileno });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send OTP using 2Factor API
    const otpResponse = await axios.get(
      `https://2factor.in/API/V1/${process.env.API_Key}/SMS/${mobileno}/AUTOGEN`
    );

    if (otpResponse.data.Status !== "Success") {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    return res.status(200).json({ message: "OTP sent successfully", sessionId: otpResponse.data.Details });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Verify OTP for Login
const loginVerify = async (req, res) => {
  try {
    const { mobileno, otp, sessionId } = req.body;

    if (!mobileno || !otp || !sessionId) {
      return res.status(400).json({ message: "Mobile number, OTP, and session ID are required" });
    }

    // Verify OTP using 2Factor API
    const verifyResponse = await axios.get(
      `https://2factor.in/API/V1/${process.env.API_Key}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (verifyResponse.data.Status !== "Success") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ mobileno });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate API Key & Secret Key if not already generated
    if (!user.apiKey || !user.secretKey) {
      user.apiKey = crypto.randomBytes(32).toString("hex");
      user.secretKey = crypto.randomBytes(64).toString("hex");
      await user.save();
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        mobileno: user.mobileno,
        apiKey: user.apiKey,
        secretKey: user.secretKey,
      },
      token: generateToken(user._id), // Using generateToken function
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Profile Fields
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fields = fields;
    await user.save();

    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getprofilebyid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const user = await User.findById(id); // Convert ID to ObjectId

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getprofile = async (req, res) => {
  try {
    const { searchTerm, page = 1, limit = 10, id } = req.query;

    // Build the query based on provided id (if any)
    const query = {};

    // If an id is provided, filter by that id
    if (id) {
      query._id = id;
    }

    // If a search term is provided, perform a case-insensitive search on the name
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: 'i' }; // Regex for name matching
    }

    // Apply pagination using skip and limit
    const users = await User.find(query)
      .skip((page - 1) * limit)  // Skip results based on the current page
      .limit(Number(limit));     // Limit the number of results

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Get the total count of users matching the query for pagination
    const countuser = await User.countDocuments(query);

    res.status(200).json({
      message: "Users fetched successfully",
      users,
      countuser,
      totalPages: Math.ceil(countuser / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Fetch User Details with API Key Authentication
 */
const fetchUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id })
      .select("mobileno fields")
      .lean(); // Convert Mongoose document to a plain object

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch responses related to this user and populate answers
    const responses = await Response.find({ userId: req.user._id }).select("answers");

    return res.status(200).json({
      _id: user._id,
      mobileno: user.mobileno,
      fields: user.fields ?? [],
      responses: responses ?? [],
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
const updateUser = async (req, res) => {
  try {
      const { mobileno, fields, answers } = req.body;
      const userId = req.user._id; // Retrieved from API key authentication

      if (!mobileno && !fields && !answers) {
          return res.status(400).json({ success: false, message: "At least one field (mobileno, fields, answers) is required for update." });
      }

      let updatedUser, updatedResponse;

      // 🔹 Update User Data (mobileno, fields)
      if (mobileno || fields) {
          updatedUser = await User.findByIdAndUpdate(
              userId,
              {
                  ...(mobileno && { mobileno }),
                  ...(fields && { fields })
              },
              { new: true, runValidators: true }
          );
      }

      // 🔹 Update Response Data (answers)
      if (answers && answers.length > 0) {
          updatedResponse = await Response.findOneAndUpdate(
              { userId },
              { $set: { answers } },
              { new: true, upsert: true }
          );
      }

      res.status(200).json({
          success: true,
          message: "User and response data updated successfully.",
          updatedUser,
          updatedResponse
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { fetchUser,signupUser, verifyOtp, loginUser, 
  updateProfile,loginVerify ,getprofile,
  getprofilebyid,updateUser};