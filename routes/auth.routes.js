const express = require('express');
const {
    login,
    logout,
    signup,
    verifyOtp,
    forgotPassword,
    resetPassword,
    checkAuth,
    resendOtp
} = require('../controllers/auth.controller');

const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

// 🔒 Check authentication (protected route)
router.get('/check-auth', verifyToken, checkAuth);

// 👤 Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// 📧 Email / OTP verification
router.post('/verify', verifyOtp);
router.post('/resend-otp', resendOtp);

// 🔐 Forgot/reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
