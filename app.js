const express = require('express');
const dotenv = require('dotenv').config();
const sequelize = require('./config/db');
const passport = require('./config/passportConfig'); // Import Passport setup
const session = require('express-session');
const authRoutes = require('./login/routes/authRoutes');
const UserSubscription = require('./login/models/userSubscriptionModel');

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use a secret key from .env
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

// Database connection
sequelize
  .sync({ alter:true}) // Set force to false to avoid resetting DB data
  .then(() => console.log('MySQL connected and models synced'))
  .catch(err => console.error('DB Error:', err));

  app.get('/', (req, res) => {
    res.send('API is running...');
  });
  
// Define a protected route for authenticated users
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    return res.send('Welcome to your Dashboard, authenticated user!');
  }
  res.redirect('/api/auth/login');
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const authenticateToken = require('./middlewares/authMiddleware');

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted to protected route', user: req.user });
});
