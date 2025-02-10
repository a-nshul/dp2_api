const express = require("express");
const upload = require('../middleware/uploadfile');
const { signupUser, verifyOtp, loginUser, loginVerify ,fetchUser,updateProfile,getprofilebyid,getprofile} = require("../controllers/userController");
const router = express.Router();
const {authenticateApiKey} =require("../middleware/authMiddleware");

router.post("/signup", signupUser);
router.post("/signup/verify", verifyOtp);
router.post("/login", loginUser);
router.post("/login/verify", loginVerify);
router.put('/updateprofile/:id', updateProfile);
  router.get('/getprofile',getprofile);
  router.get('/getprofile/:id',getprofilebyid);
  router.get("/fetch-user", authenticateApiKey, fetchUser);
module.exports = router;
