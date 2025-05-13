const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/verifyToken");


router.get('/check-auth', verifyToken, authController.checkAuth);
router.post("/signuplogin", authController.signuplog);
// router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
//router.post("/resend-otp", authController.resendOtp);
//router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
