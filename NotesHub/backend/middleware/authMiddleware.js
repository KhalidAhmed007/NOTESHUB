const jwt = require('jsonwebtoken');

/**
 * authMiddleware (protect)
 * Verifies JWT and attaches { id, role } to req.user
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach structured user object (id + role) to every protected request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    console.log(`[Auth] User: ${req.user.id} | Role: ${req.user.role}`);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

/**
 * adminOnly
 * Must be used AFTER authMiddleware.
 * Rejects any non-admin user with 403.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
