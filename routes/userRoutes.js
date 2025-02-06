const express = require("express");
const upload = require('../middleware/uploadfile');

const { signupUser, verifyOtp, loginUser, loginVerify ,
  getprofile,updateprofile,createUser,getUsers,
  updateUser,deleteUser,getprofilebyid} = require("../controllers/userController");
const {protect,isAdmin} =require("../middleware/authMiddleware");
const router = express.Router();


router.post("/signup", signupUser);
router.post("/signup/verify", verifyOtp);
router.post("/login", loginUser);
router.post("/login/verify", loginVerify);
// router.put('/updateprofile/:id',protect,upload.single('profilePhoto'), updateprofile);
router.put('/updateprofile/:id', protect, upload.fields([
    { name: 'profilePhoto', maxCount: 1 }, 
    { name: 'resume', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 }
  ]), updateprofile);
  router.get('/getprofile',getprofile);
  router.get('/getprofile/:id',getprofilebyid);
 // Admin Routes
 router.post("/admin/create-user", protect, isAdmin, createUser);
 router.put("/admin/update-user/:id", protect, isAdmin, updateUser);
 router.delete("/admin/delete-user/:id", protect, isAdmin, deleteUser);
 router.get("/admin/users", protect, isAdmin, getUsers);
//  router.get("/admin/user/:id", protect, isAdmin, getUserById);
module.exports = router;
