const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const Note = require('../models/Note');
const User = require('../models/User');

const TOTAL_MB = 512;
const WARNING_THRESHOLD_MB = 470;

// Utility to generate thumbnail URL dynamically for PDFs
const getThumbnailUrl = (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('res.cloudinary.com')) return null;
  const urlParts = fileUrl.split('res.cloudinary.com/');
  if (urlParts.length < 2) return null;
  const cloudName = urlParts[1].split('/')[0];
  return `https://res.cloudinary.com/${cloudName}/image/fetch/pg_1,w_300,h_400,c_fill,f_jpg/${fileUrl}`;
};

// GET /api/admin/storage — DB storage stats (admin only)
router.get('/storage', authMiddleware, adminOnly, async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();
    const storageBytes = stats.storageSize || stats.dataSize || 0;
    const usedMB = parseFloat((storageBytes / (1024 * 1024)).toFixed(2));
    const percentage = parseFloat(((usedMB / TOTAL_MB) * 100).toFixed(1));
    const warning = usedMB >= WARNING_THRESHOLD_MB;

    res.status(200).json({ usedMB, totalMB: TOTAL_MB, percentage, warning, warningThresholdMB: WARNING_THRESHOLD_MB });
  } catch (err) {
    console.error('Storage check error:', err);
    res.status(500).json({ error: 'Failed to retrieve storage stats.' });
  }
});

// GET /api/admin/stats — aggregate stats (admin only)
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [noteCount, userCount, totalDownloads] = await Promise.all([
      Note.countDocuments(),
      User.countDocuments(),
      Note.aggregate([{ $group: { _id: null, total: { $sum: '$downloadsCount' } } }]),
    ]);
    res.status(200).json({ notes: noteCount, users: userCount, downloads: totalDownloads[0]?.total || 0 });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin stats.' });
  }
});

// GET /api/admin/notes — all notes (admin only)
router.get('/notes', authMiddleware, adminOnly, async (req, res) => {
  try {
    const notes = await Note.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 }).lean();
    
    const notesWithThumbs = notes.map(note => ({
      ...note,
      thumbnailUrl: getThumbnailUrl(note.fileUrl)
    }));

    res.status(200).json(notesWithThumbs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

module.exports = router;
