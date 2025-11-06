const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const db = require('../database/db').getDb;
const { generateToken } = require('./jwt');

// Configure Google OAuth (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const dbInstance = db();
    const email = profile.emails[0].value;
    const username = profile.displayName || email.split('@')[0];

    // Check if user exists
    dbInstance.get(
      'SELECT * FROM users WHERE email = ? OR (oauth_provider = ? AND oauth_id = ?)',
      [email, 'google', profile.id],
      async (err, user) => {
        if (err) return done(err, null);

        if (user) {
          // Update OAuth info if needed
          if (!user.oauth_provider) {
            dbInstance.run(
              'UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?',
              ['google', profile.id, user.id]
            );
          }
          return done(null, user);
        }

        // Create new user
        const apiKey = require('crypto').randomBytes(32).toString('hex');
        dbInstance.run(
          'INSERT INTO users (username, email, oauth_provider, oauth_id, role, api_key) VALUES (?, ?, ?, ?, ?, ?)',
          [username, email, 'google', profile.id, 'user', apiKey],
          function(err) {
            if (err) return done(err, null);
            dbInstance.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
              if (err) return done(err, null);
              return done(null, newUser);
            });
          }
        );
      }
    );
  } catch (error) {
    return done(error, null);
  }
  }));
} else {
  console.log('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

// Configure GitHub OAuth (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const dbInstance = db();
    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
    const username = profile.username;

    // Check if user exists
    dbInstance.get(
      'SELECT * FROM users WHERE email = ? OR (oauth_provider = ? AND oauth_id = ?)',
      [email, 'github', profile.id],
      async (err, user) => {
        if (err) return done(err, null);

        if (user) {
          // Update OAuth info if needed
          if (!user.oauth_provider) {
            dbInstance.run(
              'UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?',
              ['github', profile.id, user.id]
            );
          }
          return done(null, user);
        }

        // Create new user
        const apiKey = require('crypto').randomBytes(32).toString('hex');
        dbInstance.run(
          'INSERT INTO users (username, email, oauth_provider, oauth_id, role, api_key) VALUES (?, ?, ?, ?, ?, ?)',
          [username, email, 'github', profile.id, 'user', apiKey],
          function(err) {
            if (err) return done(err, null);
            dbInstance.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
              if (err) return done(err, null);
              return done(null, newUser);
            });
          }
        );
      }
    );
  } catch (error) {
    return done(error, null);
  }
  }));
} else {
  console.log('⚠️  GitHub OAuth not configured (missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET)');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const dbInstance = db();
  dbInstance.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

module.exports = passport;

