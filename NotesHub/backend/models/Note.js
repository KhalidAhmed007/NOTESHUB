const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true }, // Indexed for easy searching
  subject: { type: String, required: true, index: true },
  branch: { type: String, required: true, index: true },
  semester: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 8,
    index: true 
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileUrl: { type: String, required: true },
  public_id: { type: String, required: true },
  downloadsCount: { type: Number, default: 0 },
  rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
}, { timestamps: true });

// Compound index for efficient feed querying by branch and semester
noteSchema.index({ branch: 1, semester: 1 });

module.exports = mongoose.model('Note', noteSchema);
