const mongoose = require('mongoose');

// Canonical branch list — single source of truth
const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI/ML'];

const noteSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  subject:  { type: String, required: true, trim: true },   // "course name"
  branch:   { type: String, required: true, enum: BRANCHES },
  semester: { type: Number, required: true, min: 1, max: 8 },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl:       { type: String, required: true },
  public_id:     { type: String, required: true },
  downloadsCount:{ type: Number, default: 0, min: 0 },
  viewsCount:    { type: Number, default: 0, min: 0 },
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────────────
noteSchema.index({ title: 'text', subject: 'text' });        // full-text search
noteSchema.index({ branch: 1, semester: 1 });                // filter combo
noteSchema.index({ downloadsCount: -1 });                    // trending sort
noteSchema.index({ viewsCount: -1 });                        // views sort
noteSchema.index({ createdAt: -1 });                         // latest sort
noteSchema.index({ 'rating.average': -1 });                  // rating sort
noteSchema.index({ uploadedBy: 1 });                         // my-uploads query

module.exports = mongoose.model('Note', noteSchema);
module.exports.BRANCHES = BRANCHES;
