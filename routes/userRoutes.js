const express = require("express");
const upload = require('../middleware/uploadfile');

const { signupUser, verifyOtp, loginUser, loginVerify ,updateprofile,getprofilebyid,getprofile} = require("../controllers/userController");
const {protect} =require("../middleware/authMiddleware");
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
module.exports = router;
