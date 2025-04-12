const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../login/models/userModel'); // Adjust path based on your structure

// Local Strategy for username/password authentication
passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false, { message: 'Incorrect username.' }); }
      if (!user.validPassword(password)) { return done(null, false, { message: 'Incorrect password.' }); }
      return done(null, user);
    });
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID, // Get from Google Cloud Console
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Get from Google Cloud Console
    callbackURL: '/api/auth/google/callback' // Must match the redirect URI in Google Console
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if the user exists in the database
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // If user doesn't exist, create a new one
        user = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value // Google returns an array of emails
        });
      }

      return done(null, user); // Pass the user to the next middleware
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize and deserialize user (for session handling)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;