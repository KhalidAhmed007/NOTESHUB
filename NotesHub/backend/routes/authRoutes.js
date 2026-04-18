const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// POST /api/auth/signup
router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Include id + role in JWT payload
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { email, password } = req.body;

    // Always fetch fresh role from DB — never trust cached values
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    // Embed fresh role into token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[Login] ${user.email} → role: ${user.role}`);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/verify
// Rehydrates session on page refresh — returns fresh user data if token is valid
router.get('/verify', require('../middleware/authMiddleware').authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during verification.' });
  }
});

// PUT /api/auth/change-password
// Changes the logged-in user's password after verifying the current one.
router.put('/change-password',
  require('../middleware/authMiddleware').authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' });

      if (currentPassword === newPassword) {
        return res.status(400).json({ error: 'New password cannot be the same as current password.' });
      }

      // Hash and save new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      console.log(`[ChangePassword] User ${user.email} updated their password.`);
      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (err) {
      console.error('[ChangePassword]', err);
      res.status(500).json({ error: 'Server error changing password.' });
    }
  }
);

module.exports = router;
