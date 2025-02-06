const express = require("express");
const { createAdmin,getAdmin,updateAdmin,deleteAdmin,getAdminById,createUser,getUser,getUserById,updateuser,deleteUser} = require("../controllers/adminController");
const router = express.Router();
const {isAdmin} =require("../middleware/authMiddleware");

router.post("/create-admin", createAdmin);
router.get("/get-admin", getAdmin);
router.get("/get-admin/:id",  getAdminById);  
router.put("/update-admin/:id",  updateAdmin);
router.delete("/delete-admin/:id", deleteAdmin);

//CRUD for user data with admin id 
router.post("/create-user", isAdmin,createUser);
router.get("/get-user", isAdmin,getUser);
router.get("/get-user/:id",  isAdmin,getUserById);  
router.put("/update-user/:id",  isAdmin,updateuser);
router.delete("/delete-user/:id", isAdmin,deleteUser);
module.exports = router;
