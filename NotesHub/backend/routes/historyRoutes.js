const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const History = require('../models/History');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/history/view
router.post('/view', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ error: 'Missing noteId.' });

    const historyEntry = new History({
      userId: req.user.id,
      noteId,
      action: 'view',
    });
    await historyEntry.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error logging view.' });
  }
});

// POST /api/history/download
router.post('/download', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ error: 'Missing noteId.' });

    const historyEntry = new History({
      userId: req.user.id,
      noteId,
      action: 'download',
    });
    await historyEntry.save();

    // Increment global download counter
    await Note.findByIdAndUpdate(noteId, { $inc: { downloadsCount: 1 } });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error logging download.' });
  }
});

// GET /api/history/user — current user's activity timeline
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const historyLogs = await History.find({ userId: req.user.id })
      .populate({ path: 'noteId', select: 'title subject branch semester fileUrl' })
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json(historyLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching history.' });
  }
});

module.exports = router;
