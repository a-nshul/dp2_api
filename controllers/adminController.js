const Admin = require("../models/adminModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Response =require("../models/responseModel");
const mongoose = require("mongoose");
const crypto = require("crypto");
// Generate a secure random key
const generateKey = () => {
  return crypto.randomBytes(32).toString("hex");
};
// Admin Signup
const signupAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if admin exists
      const adminExists = await Admin.findOne({ email });
      if (adminExists) {
        return res.status(400).json({ message: "Admin already exists" });
      }
  
      // Create new admin
      const admin = await Admin.create({ email, password });
  
      if (!admin) {
        return res.status(400).json({ message: "Invalid admin data" });
      }
  
      return res.status(200).json({
        _id: admin.id,
        email: admin.email,
        token: generateToken(admin.id),
        message: "Admin signup successfully",
      });
  
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };

// Admin Login
const loginAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const admin = await Admin.findOne({ email });
  
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      const isMatch = await admin.matchPassword(password);
  
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      return res.status(200).json({
        _id: admin.id,
        email: admin.email,
        token: generateToken(admin.id),
        message: "Admin login successfully",
      });
      
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

// Get admin by ID
const getAdminById = async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id).select("-password");
  
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      return res.status(200).json({
        admin,
        message: "Admin fetched successfully",
      });
  
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
      const admins = await Admin.find().select("-password");
  
      if (!admins || admins.length === 0) {
        return res.status(404).json({ message: "No admins found" });
      }
    const countAdmin=await Admin.countDocuments();
      return res.status(200).json({
        message: "Admins fetched successfully",
        admins,
        countAdmin
      });
  
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

// Update Admin
const updateAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findById(req.params.id);
  
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      admin.email = email || admin.email;
      if (password) {
        admin.password = await bcrypt.hash(password, 10);
      }
  
      const updatedAdmin = await admin.save();
  
      return res.status(200).json({
        message: "Admin updated successfully",
        admin: {
          _id: updatedAdmin.id,
          email: updatedAdmin.email,
        },
      });
  
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
// Delete Admin
const deleteAdmin = async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id);
  
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      await admin.deleteOne();
  
      return res.status(200).json({ message: "Admin deleted successfully" });
  
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  const createUser =async(req,res)=>{
    try {
      const adminId =req.headers["admin-id"];
      if(!adminId) {
        return res.status(401).json({ message: "plz provide admin id to update user data." });
      }
      const {mobileno,fields}=req.body;
      if(!mobileno || !fields){
        return res.status(400).json({ message: "plz provide all required fields." });
      }
      const existingMobileno =await User.findOne({mobileno});
      if(existingMobileno){
        return res.status(400).json({ message: "User already exists with this mobileno." });
      }
        // ✅ Generate `apiKey` and `secretKey`
       const apiKey = generateKey();
       const secretKey = generateKey();
      const createuser =await User.create({
        mobileno,
        fields,
        apiKey,
        secretKey,
      })
      return res.status(200).json({
        message: "User created successfully",
        user: createuser
      })
    } catch (error) {
      res.status(500).json({message:error.message});
    }
  }
  const getUser = async (req, res) => {
    try {
        const adminId = req.headers["admin-id"];

        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID provided." });
        }

        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found for this admin." });
        }

        return res.status(200).json({
            message: "Users fetched successfully",
            users
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
const updateuser =async(req,res)=>{
  try{
    const adminId =req.headers["admin-id"];
    if(!adminId ||!mongoose.Types.ObjectId.isValid(adminId)){
      return res.status(400).json({ message: "Invalid admin ID provided." });
    }
    const {mobileno,fields}=req.body;
    if(!mobileno ||!fields){
      return res.status(400).json({ message: "plz provide all required fields." });
    }
    const user = await User.findOneAndUpdate({mobileno},{$set:fields},{new:true});
    if(!user){
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
      message: "User updated successfully",
      user
    })
  }catch(e){
    res.status(500).json({ message:e.message });
  }
}
const deleteUser = async(req,res)=>{
  try{
    const adminId =req.headers["admin-id"];
    if(!adminId ||!mongoose.Types.ObjectId.isValid(adminId)){
      return res.status(400).json({ message: "Invalid admin ID provided." });
    }
    const {id}=req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({ message: "Invalid user ID provided." });  // check if the id is valid or not. 400 Bad Request status code is returned if not. 404 Not Found status code is returned if the id is not found in the database. 200 OK status code is returned if the user is deleted successfully. 500 Server Error status code is returned if there is an error while deleting the user.  // 400 Bad Request status code is returned if the id is invalid or not. 404 Not Found status code is returned if the id is not found in the database. 200 OK status code is returned if the user is deleted successfully. 500 Server Error status code is returned if there is an error while deleting the user.  // 400 Bad Request status code is returned if the id is invalid or not. 40
    }
    const user = await User.findByIdAndDelete(id);
    if(!user){
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
      message: "User deleted successfully",
      user
    })
  }catch(e){
    res.status(500).json({ message:e.message });
  }
}
const getUserById =async(req,res)=>{
  try{
    const adminId =req.headers["admin-id"];
    if(!adminId ||!mongoose.Types.ObjectId.isValid(adminId)){
      return res.status(400).json({ message: "Invalid admin ID provided." });
    }
    const {id}=req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({ message: "Invalid user ID provided." });
    }
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      user
    })
  }catch(e){
    res.status(500).json({ message:e.message });
  }
}
const submitResponse =async(req,res)=>{
  try {
    const adminId =req.headers["admin-id"];
    if(!adminId ||!mongoose.Types.ObjectId.isValid(adminId)){
      return res.status(400).json({ message: "Invalid admin ID provided." });
    }
    const {userId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)){
      return res.status(400).json({ message: "Invalid user ID provided." });
    }
    const {answers}=req.body;
    if (!userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid request data" });
  }
  const response =await Response.create({
    userId,
    answers,
  })
  return res.status(200).json({
    message: "Response submitted successfully",
    response,
  });
  } catch (error) {
    res.status(500).json({message:error.message})
  }
}
const getsubmitResponse =async(req,res)=>{
  try {
    const adminId =req.headers["admin-id"];
    if(!adminId ||!mongoose.Types.ObjectId.isValid(adminId)){
      return res.status(400).json({ message: "Invalid admin ID provided." });
    }
    const {userId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)){
      return res.status(400).json({ message: "Invalid user ID provided." });
    }
    const response = await Response.findOne({userId})
    if(!response){
      return res.status(404).json({ message: "No response found for this user." });
    }
    return res.status(200).json({
      message: "Response fetched successfully",
      response,
    });
  } catch (error) {
    res.status(500).json({message:error.message})
  }
}

const updateAdminResponse = async (req, res) => {
  try {
    const adminId = req.headers["admin-id"];
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID provided." });
    }

    const { userId, answers } = req.body;
    const { responseId } = req.params; // Get responseId from URL params

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID provided." });
    }

    if (!responseId || !mongoose.Types.ObjectId.isValid(responseId)) {
      return res.status(400).json({ message: "Invalid response ID provided." });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format. Must be an array." });
    }

    // Find response by responseId and userId
    const response = await Response.findOne({ _id: responseId, userId });

    if (!response) {
      return res.status(404).json({ message: "Response not found for this user." });
    }

    // Replace the entire answers array with new data
    response.answers = answers;
    response.updatedAt = new Date(); // Update timestamp

    await response.save(); // Save changes

    return res.status(200).json({
      message: "Response updated successfully",
      response,
    });
  } catch (error) {
    console.error("Error updating response:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAdminResponse=async(req,res)=>{
  try {
    const adminId =req.headers["admin-id"];
    if(!adminId ||!mongoose.Types.ObjectId.isValid(adminId)){
      return res.status(400).json({ message: "Invalid admin ID provided." });
    }
    const {userId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)){
      return res.status(400).json({ message: "Invalid user ID provided." });
    }
    const response = await Response.findByIdAndDelete(userId)
    if(!response){
      return res.status(404).json({ message: "Response not found for this user." });
    }
    return res.status(200).json({
      message: "Response deleted successfully",
    });
  } catch (error) {
    res.status(500).json({message:error.message});
  }
}
module.exports = {
  signupAdmin,
  loginAdmin,
  getAdminById,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  createUser,
  getUser,
  updateuser,
  deleteUser,
  getUserById,
  submitResponse,
  getsubmitResponse,
  updateAdminResponse,
  deleteAdminResponse
};
