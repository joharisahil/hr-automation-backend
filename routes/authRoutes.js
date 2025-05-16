const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/verifyToken");


router.get('/check-auth', verifyToken, authController.checkAuth);

router.post("/signuplogin", authController.signuplog);

router.post("/verify-otp", authController.verifyOtp);

router.post("/logout", authController.logout);

router.post("/org-subscription", verifyToken, authController.orgSubscription);

module.exports = router;