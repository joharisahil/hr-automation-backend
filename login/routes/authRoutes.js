const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login } = require('../controllers/authController');
const {
  forgotPassword,
  resetPasswordByEmail,
  resetPasswordByOTP
} = require('../controllers/authController');

//forget password routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/email', resetPasswordByEmail);
router.post('/reset-password/otp', resetPasswordByOTP);

// Local authentication routes
router.post('/register', register);
router.post('/login', login);

// Google Sign-In routes using Passport
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'] // Request user profile and email from Google
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/api/auth/login', // Redirect on failure
  successRedirect: '/dashboard' // Redirect on success
}));

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Successfully logged out' });
});

module.exports = router;