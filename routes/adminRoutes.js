const express = require("express");
const {
  signupAdmin,
  loginAdmin,
  getAdminById,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,createUser,getUser,
  updateuser,deleteUser,getUserById,
  submitResponse,getsubmitResponse,updateAdminResponse,deleteAdminResponse
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);

// Protected Routes
router.get("/all",  getAllAdmins);
router.get("/:id",  getAdminById);
router.put("/:id",  updateAdmin);
router.delete("/:id",  deleteAdmin);


//CRUD for user data with admin id 
router.get("/get/user", getUser);
router.post("/create-user", createUser);
router.get("/get/user/:id",  getUserById);  
router.put("/update/user/:id",  updateuser);
router.delete("/delete/user/:id", deleteUser);
//CRUD for submit response 
router.post("/submit-response/:userId", submitResponse);
router.get("/submit-response/:userId", getsubmitResponse);
router.put("/submit-response/:responseId",updateAdminResponse);
router.delete("/submit-response/:userId",deleteAdminResponse);
module.exports = router;
