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


const jwt = require('jsonwebtoken');


// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token not found' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalid' });
    req.user = user;
    next();
  });
};

// Add this route
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'You accessed a protected route!',
    user: req.user
  });
});

module.exports = router;
