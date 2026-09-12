const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const historyRoutes = require('./routes/historyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ── Allowed Origins ──────────────────────────────────────────────────────────
const rawClientUrl = process.env.CLIENT_URL;
const sanitizedClientUrl = rawClientUrl ? rawClientUrl.replace(/\/$/, "") : null;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  sanitizedClientUrl,
].filter(Boolean);

// ── Global Middleware & Security ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    console.warn(`[CORS Blocked] Origin: ${origin} not in [${allowedOrigins.join(', ')}]`);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/user', userRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error.' });
});

// ── Connect & Listen ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/noteshub';

// Safety check for production
if (!process.env.MONGO_URI && process.env.NODE_ENV === 'production') {
  console.error("❌ MONGO_URI is missing in production!");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });


