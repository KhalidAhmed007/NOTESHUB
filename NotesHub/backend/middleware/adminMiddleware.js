const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * adminMiddleware - verifies JWT and confirms user has role: 'admin'
 */
const adminMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'No token, authorization denied.' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('role');

    if (!user) return res.status(401).json({ error: 'User not found.' });
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    req.user = decoded.userId;
    req.role = user.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

module.exports = adminMiddleware;
