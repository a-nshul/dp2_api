const express = require("express");
const { createAdmin,getAdmin,updateAdmin,deleteAdmin,getAdminById,createUser,getUser,getUserById,updateuser,deleteUser} = require("../controllers/adminController");
const router = express.Router();

router.post("/create-admin", createAdmin);
router.get("/get-admin", getAdmin);
router.get("/get-admin/:id",  getAdminById);  
router.put("/update-admin/:id",  updateAdmin);
router.delete("/delete-admin/:id", deleteAdmin);

//CRUD for user data with admin id 
router.post("/create-user", createUser);
router.get("/get-user", getUser);
router.get("/get-user/:id",  getUserById);  
router.put("/update-user/:id",  updateuser);
router.delete("/delete-user/:id", deleteUser);
module.exports = router;
