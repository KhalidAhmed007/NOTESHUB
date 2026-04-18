const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/Note');
const History = require('../models/History');
const { authMiddleware } = require('../middleware/authMiddleware');

// ── GET /api/user/stats — role-based stats (Admin vs User) ──────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (isAdmin) {
      // Global Platform Stats for Admin
      const [
        totalNotes,
        totalUsers,
        globalDownloads,
        totalViews
      ] = await Promise.all([
        Note.countDocuments(),
        Note.model('User').countDocuments(),
        Note.aggregate([{ $group: { _id: null, total: { $sum: '$downloadsCount' } } }]),
        Note.aggregate([{ $group: { _id: null, total: { $sum: '$viewsCount' } } }]),
      ]);

      return res.status(200).json({
        isAdmin: true,
        totalNotes,
        totalUsers,
        totalDownloads: globalDownloads[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0,
      });
    }

    // Personal Stats for regular Users
    const [
      totalNotes,
      myUploads,
      myDownloads,
      recentViews,
    ] = await Promise.all([
      Note.countDocuments(),
      Note.countDocuments({ uploadedBy: userId }),
      History.countDocuments({ userId, action: 'download' }),
      History.countDocuments({
        userId,
        action: 'view',
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.status(200).json({
      isAdmin: false,
      totalNotes,
      myUploads,
      downloads: myDownloads,
      recentViews: recentViews,
    });
  } catch (err) {
    console.error('[UserStats]', err);
    res.status(500).json({ error: 'Server error fetching stats.' });
  }
});

// Utility to generate thumbnail URL dynamically for PDFs
const getThumbnailUrl = (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('res.cloudinary.com')) return null;
  const urlParts = fileUrl.split('res.cloudinary.com/');
  if (urlParts.length < 2) return null;
  const cloudName = urlParts[1].split('/')[0];
  return `https://res.cloudinary.com/${cloudName}/image/fetch/pg_1,w_300,h_400,c_fill,f_jpg/${fileUrl}`;
};

// ── GET /api/user/recent-notes — last 5 unique notes viewed ──────────────────
router.get('/recent-notes', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const recentHistory = await History.find({ userId, action: 'view' })
      .sort({ timestamp: -1 })
      .limit(30)
      .populate({
        path:    'noteId',
        select:  'title subject branch semester fileUrl rating downloadsCount viewsCount uploadedBy createdAt',
        populate: { path: 'uploadedBy', select: 'name' },
      });

    // Deduplicate by noteId, keep most recent
    const seen = new Set();
    const uniqueNotes = [];
    for (const entry of recentHistory) {
      if (!entry.noteId) continue;
      const id = entry.noteId._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        const noteObj = entry.noteId.toObject ? entry.noteId.toObject() : { ...entry.noteId._doc };
        noteObj.thumbnailUrl = getThumbnailUrl(noteObj.fileUrl);
        uniqueNotes.push(noteObj);
      }
      if (uniqueNotes.length >= 5) break;
    }

    res.status(200).json(uniqueNotes);
  } catch (err) {
    console.error('[RecentNotes]', err);
    res.status(500).json({ error: 'Server error fetching recent notes.' });
  }
});

module.exports = router;
