const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ msg: 'No token, access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
  
  module.exports = ensureAuthenticated;
  
const ensureAuthenticated = require('./middlewares/authMiddleware');

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send('Welcome to your dashboard');
});

module.exports = authMiddleware;
