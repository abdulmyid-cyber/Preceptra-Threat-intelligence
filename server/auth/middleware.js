const { verifyToken } = require('./jwt');
const db = require('../database/db').getDb;

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Get fresh user data from database
  const dbInstance = db();
  dbInstance.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole
};

