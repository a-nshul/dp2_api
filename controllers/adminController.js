const Admin =require('../models/adminModel');
const User = require('../models/userModel');
const createAdmin =async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:"Please provide both email and password"});
        }
        const adminExists = await Admin.findOne({email});
        if(adminExists){
            return res.status(400).json({message:"Admin already exists with this email"});
        }
        const newAdmin =await Admin.create({
            email,
            password
        })
        res.status(201).json({message:"Admin created successfully",newAdmin});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
const getAdmin =async(req,res)=>{
    try {
        const fetchAdmin =await Admin.find();
        if(!fetchAdmin){
            return res.status(404).json({message:"No admin found"});
        }
        const count =await Admin.countDocuments();
        res.status(200).json({message:"Admin fetched successfully",fetchAdmin,count});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}

const getAdminById=async(req,res)=>{
    try {
        const {id}=req.params;
        if(!id){
            return res.status(400).json({message:"Please provide id"});
        }
        const fetchAdmin = await Admin.findById(id);
        if(!fetchAdmin){
            return res.status(404).json({message:"Admin not found"});
        }
        res.status(200).json({message:"Admin fetched successfully",fetchAdmin});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
const updateAdmin = async(req,res)=>{
    try {
        const {id}=req.params;
        if(!id){
            return res.status(400).json({message:"Please provide id"});
        }
        const updateAdmin = await Admin.findByIdAndUpdate(id,req.body,{new:true});
        if(!updateAdmin){
            return res.status(404).json({message:"Admin not found"});
        }
        res.status(200).json({message:"Admin updated successfully",updateAdmin});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};
const deleteAdmin = async(req,res)=>{
    try {
        const {id}=req.params;
        if(!id){
            return res.status(400).json({message:"Please provide id"});
        }
        const deleteAdmin = await Admin.findByIdAndDelete(id);
        if(!deleteAdmin){
            return res.status(404).json({message:"Admin not found"});
        }
        res.status(200).json({message:"Admin deleted successfully",deleteAdmin});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
const createUser =async(req,res)=>{
    try {
        const adminId = req.headers["admin-id"]; // Extract adminId from headers

        if (!adminId) {
            return res.status(400).json({ message: "Admin ID is required in headers" });
        }

        // Ensure the provided admin ID exists
        const adminExists = await Admin.findById(adminId);
        if (!adminExists) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const newUser =await User.create(req.body);

        res.status(201).json({ message: "User created successfully", newUser });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getUser = async(req,res)=>{
    try {
        const adminId = req.headers["admin-id"]; // Extract adminId from headers

        if (!adminId) {
            return res.status(400).json({ message: "Admin ID is required in headers" });
        }

        // Ensure the provided admin ID exists
        const adminExists = await Admin.findById(adminId);
        if (!adminExists) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const fetchUser = await User.find();
        if(!fetchUser){
            return res.status(404).json({message:"No user found"});
        }
        const count = await User.countDocuments();
        res.status(200).json({message:"User fetched successfully",fetchUser,count});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};
const getUserById =async(req,res)=>{
    try{
        const adminId = req.headers["admin-id"]; // Extract adminId from headers

        if (!adminId) {
            return res.status(400).json({ message: "Admin ID is required in headers" });
        }

        // Ensure the provided admin ID exists
        const adminExists = await Admin.findById(adminId);
        if (!adminExists) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const {id}=req.params;
        if(!id){
            return res.status(400).json({message:"Please provide id"});
        }
        const fetchUser = await User.findById(id);
        if(!fetchUser){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({message:"User fetched successfully",fetchUser});
    }catch(err){
     res.status(500).json({message: err.message});
    }
}
const updateuser =async(req,res)=>{
    try{
        const adminId = req.headers["admin-id"]; // Extract adminId from headers

        if (!adminId) {
            return res.status(400).json({ message: "Admin ID is required in headers" });
        }

        // Ensure the provided admin ID exists
        const adminExists = await Admin.findById(adminId);
        if (!adminExists) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const {id}=req.params;
        if(!id){
            return res.status(400).json({message:"Please provide id"});
        }
        const updateUser = await User.findByIdAndUpdate(id,req.body,{new:true});
        if(!updateUser){
            return res.status(404).json({message:"User not found"});
        }
    }catch(err){
     res.status(500).json({message:err.message});
    }
}
const deleteUser =async(req,res)=>{
    try{
        const adminId = req.headers["admin-id"]; // Extract adminId from headers

        if (!adminId) {
            return res.status(400).json({ message: "Admin ID is required in headers" });
        }

        // Ensure the provided admin ID exists
        const adminExists = await Admin.findById(adminId);
        if (!adminExists) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const {id}=req.params;
        if(!id){
            return res.status(400).json({message:"Please provide id"});
        }
        const deleteUser = await User.findByIdAndDelete(id);
        if(!deleteUser){
            return res.status(404).json({message:"User not found"});
        }
    }catch(err){
     res.status(500).json({message:err.message});
    }
}
module.exports = {createAdmin,getAdmin,getAdminById,updateAdmin,deleteAdmin,createUser,getUser,getUserById,updateuser,deleteUser};