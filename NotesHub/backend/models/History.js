const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
  action: { type: String, enum: ['view', 'download'], required: true },
  timestamp: { type: Date, default: Date.now }
});

// Compound index to quickly fetch a single user's ordered history
historySchema.index({ userId: 1, timestamp: -1 });

// Compound index to quickly aggregate stats per note (e.g., total views vs downloads)
historySchema.index({ noteId: 1, action: 1 });

module.exports = mongoose.model('History', historySchema);
