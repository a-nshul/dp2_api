const Admin = require("../models/adminModel");
const generateToken = require("../config/generateToken");
const bcrypt = require("bcryptjs");

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
  
module.exports = {
  signupAdmin,
  loginAdmin,
  getAdminById,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
};
