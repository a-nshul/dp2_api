const User =require("../models/userModel");
const axios = require("axios");
const generateToken = require("../config/generateToken");
const mongoose = require("mongoose");
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
      console.error(verifyResponse.data.Message);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ mobileno });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Login successful",
      user,
      token: generateToken(user._id),
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


module.exports = { signupUser, verifyOtp, loginUser, updateProfile,loginVerify ,getprofile,getprofilebyid};