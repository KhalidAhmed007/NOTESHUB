const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  noteId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  value:   { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

// One rating per user per note
ratingSchema.index({ userId: 1, noteId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
