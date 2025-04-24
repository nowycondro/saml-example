const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-saml');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const ISSUER = "THE_ISSUER"; // Replace with your actual issuer.
const ENTRY_POINT = "THE_LOCATION_FROM_XML"; // Replace with your actual entry point.

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

const cert = fs.readFileSync(path.join(__dirname, 'certificate.cer'), 'utf8');

// Initialize SAML configuration
let samlConfig = {
  callbackUrl: 'http://localhost:3000/login/callback',
  issuer: ISSUER,
  entryPoint: ENTRY_POINT,
  cert: cert,
  identifierFormat: null,
  validateInResponseTo: true,
  disableRequestedAuthnContext: true
};

passport.use(new Strategy(samlConfig, (profile, done) => {
  // Add authorization logic if needed here.
  return done(null, profile);
}));

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Simple authentication test endpoint
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // User is authenticated, show their profile
    res.send(`
      <h1>Authentication Successful</h1>
      <p>User Identity: ${req.user.nameID}</p>
      <pre>${JSON.stringify(req.user, null, 2)}</pre>
      <p><a href="/logout">Logout</a></p>
    `);
  } else {
    // User is not authenticated, show login button
    res.send(`
      <h1>Azure Entra ID SAML Authentication</h1>
      <p>Click the button below to authenticate with Azure Entra ID</p>
      <form action="/auth/saml" method="get">
        <button type="submit">Login with Azure</button>
      </form>
    `);
  }
});

// Initiate SAML authentication
app.get('/auth/saml', passport.authenticate('saml', {
  failureRedirect: '/login-error'
}));

// Handle SAML response
app.post('/login/callback',
  passport.authenticate('saml', { failureRedirect: '/login-error' }),
  (req, res) => {
    // Authentication successful - redirect to home page
    res.redirect('/');
  }
);

// Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Error route
app.get('/login-error', (req, res) => {
  res.send(`
    <h1>Authentication Error</h1>
    <p>Failed to authenticate with Azure Entra ID.</p>
    <p><a href="/">Try Again</a></p>
  `);
});

// Initialize the application
(async function() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();
