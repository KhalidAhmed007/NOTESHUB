const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Note   = require('../models/Note');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * POST /api/ratings/:noteId
 * Submit or update a star rating (1–5) for a note.
 */
router.post('/:noteId', authMiddleware, async (req, res) => {
  try {
    const { value } = req.body;
    const numVal = Number(value);
    if (!numVal || numVal < 1 || numVal > 5) {
      return res.status(400).json({ error: 'Rating value must be 1–5.' });
    }

    const { noteId } = req.params;
    const userId = req.user.id;

    // Upsert: update existing or create new rating
    await Rating.findOneAndUpdate(
      { userId, noteId },
      { value: numVal },
      { upsert: true, new: true }
    );

    // Recalculate average from all ratings for this note
    const stats = await Rating.aggregate([
      { $match: { noteId: require('mongoose').Types.ObjectId.createFromHexString(noteId) } },
      { $group: { _id: null, avg: { $avg: '$value' }, count: { $sum: 1 } } },
    ]);

    const average = stats.length ? parseFloat(stats[0].avg.toFixed(1)) : 0;
    const count   = stats.length ? stats[0].count : 0;

    await Note.findByIdAndUpdate(noteId, { 'rating.average': average, 'rating.count': count });

    // Return the user's own rating + updated aggregate
    const userRating = await Rating.findOne({ userId, noteId });
    res.status(200).json({ average, count, userRating: userRating?.value || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving rating.' });
  }
});

/**
 * GET /api/ratings/:noteId
 * Get aggregate rating + current user's rating for a note.
 */
router.get('/:noteId', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const [note, userRating] = await Promise.all([
      Note.findById(noteId).select('rating'),
      Rating.findOne({ userId, noteId }),
    ]);

    res.status(200).json({
      average:    note?.rating?.average || 0,
      count:      note?.rating?.count   || 0,
      userRating: userRating?.value     || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching rating.' });
  }
});

module.exports = router;
