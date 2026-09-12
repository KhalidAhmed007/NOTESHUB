const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified:  { type: Boolean, default: false },
  otp:         { type: String,  default: null },
  otpExpiry:   { type: Date,    default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
