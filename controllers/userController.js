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

const updateprofile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto) {
        updateData.personalDetails = updateData.personalDetails || {};
        updateData.personalDetails.profilePhoto = req.files.profilePhoto[0].path;
      }
      if (req.files.resume) {
        updateData.documentUploads = updateData.documentUploads || {};
        updateData.documentUploads.resume = req.files.resume[0].path;
      }
      if (req.files.idProof) {
        updateData.documentUploads = updateData.documentUploads || {};
        updateData.documentUploads.idProof = req.files.idProof[0].path;
      }
      if (req.files.addressProof) {
        updateData.documentUploads = updateData.documentUploads || {};
        updateData.documentUploads.addressProof = req.files.addressProof[0].path;
      }
    }

    // Ensure all nested sections are initialized to avoid overwriting
    updateData.personalDetails = updateData.personalDetails || {};
    updateData.contactInformation = updateData.contactInformation || {};
    updateData.addressDetails = updateData.addressDetails || {};
    updateData.professionalDetails = updateData.professionalDetails || {};
    updateData.matrimonyDetails = updateData.matrimonyDetails || {};
    updateData.propertyDetails = updateData.propertyDetails || {};
    updateData.additionalFeatures = updateData.additionalFeatures || {};
    updateData.documentUploads = updateData.documentUploads || {};

    // Log the updated data
    console.log("Updated Profile Data: ", updateData);

    // Update the user
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated user
      runValidators: true, // Validate the updated data according to the schema
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
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

const getprofile =async(req,res)=>{
  try {
    const user =await User.find();
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }
    const countuser =await User.countDocuments();
    res.status(200).json({ message: "Users fetched successfully", user,countuser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
const createUser =async(req,res)=>{
  try {
    const newUser =await User.create(req.body);
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message:error.message});
  }
}

const getUsers = async(req,res)=>{
  try {
    const users = await User.find({});
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getUserById = async(req,res)=>{
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const deleteUser = async(req,res)=>{
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
const updateUser = async(req,res)=>{
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true, 
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
module.exports = { signupUser, verifyOtp, loginUser, loginVerify ,getprofile,updateprofile,createUser,getUsers,getUserById,deleteUser,updateUser,getprofilebyid};