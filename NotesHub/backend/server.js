const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes    = require('./routes/authRoutes');
const noteRoutes    = require('./routes/noteRoutes');
const historyRoutes = require('./routes/historyRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const ratingRoutes  = require('./routes/ratingRoutes');

const app = express();

// Global Middleware & Security Firewalls
app.use(helmet()); // Secure HTTP headers against framing/XSS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth',    authRoutes);
app.use('/api/notes',   noteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/ratings', ratingRoutes);

// Connect config
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI 
    // || 'mongodb://127.0.0.1:27017/noteshub';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB local database');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
  });
