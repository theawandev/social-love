// backend/src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { User } = require('../models');

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key'
}, async (payload, done) => {
  try {
    const user = await User.findByPk(payload.userId, {
      where: { is_active: true }
    });
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists with this Google ID
    let user = await User.findOne({
      where: { google_id: profile.id, is_active: true }
    });

    if (user) {
      return done(null, user);
    }

    // Check if user exists with this email
    user = await User.findOne({
      where: { email: profile.emails[0].value, is_active: true }
    });

    if (user) {
      // Link Google account to existing user
      await user.update({ google_id: profile.id });
      return done(null, user);
    }

    // Create new user
    const newUser = await User.create({
      username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
      email: profile.emails[0].value,
      google_id: profile.id,
      first_name: profile.name.givenName,
      last_name: profile.name.familyName,
      profile_image: profile.photos[0]?.value
    });

    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;