const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const History = require('../models/History');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/history/view — log a view and increment viewsCount
router.post('/view', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ error: 'Missing noteId.' });

    // Log history entry
    await History.create({ userId: req.user.id, noteId, action: 'view' });

    // Increment viewsCount on the note
    await Note.findByIdAndUpdate(noteId, { $inc: { viewsCount: 1 } });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[History View]', err);
    res.status(500).json({ error: 'Server error logging view.' });
  }
});

// POST /api/history/download — log a download and increment downloadsCount
router.post('/download', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ error: 'Missing noteId.' });

    // Log history entry
    await History.create({ userId: req.user.id, noteId, action: 'download' });

    // Increment global download counter
    await Note.findByIdAndUpdate(noteId, { $inc: { downloadsCount: 1 } });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[History Download]', err);
    res.status(500).json({ error: 'Server error logging download.' });
  }
});

// GET /api/history/user — current user's activity timeline
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const historyLogs = await History.find({ userId: req.user.id })
      .populate({
        path:   'noteId',
        select: 'title subject branch semester fileUrl',
      })
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json(historyLogs);
  } catch (err) {
    console.error('[History User]', err);
    res.status(500).json({ error: 'Server error fetching history.' });
  }
});

module.exports = router;
