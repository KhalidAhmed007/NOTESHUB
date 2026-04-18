const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { BRANCHES } = require('../models/Note');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../config/cloudinary');

// ── GET /api/notes — search, filter, sort ────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, branch, semester, subject, sortBy } = req.query;
    let query = {};

    // Full-text or regex search
    if (search) {
      query.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch  && branch  !== 'All') query.branch   = branch;
    if (semester && semester !== 'All') query.semester = Number(semester);
    if (subject && subject !== 'All') query.subject   = { $regex: subject, $options: 'i' };

    // Sort strategy
    let sortOption = { createdAt: -1 }; // default: latest
    if (sortBy === 'views')    sortOption = { viewsCount:     -1 };
    if (sortBy === 'downloads') sortOption = { downloadsCount: -1 };
    if (sortBy === 'rating')   sortOption = { 'rating.average': -1, 'rating.count': -1 };

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name email')
      .sort(sortOption)
      .lean();

    res.status(200).json(notes);
  } catch (err) {
    console.error('[Notes GET]', err);
    res.status(500).json({ error: 'Server error fetching notes.' });
  }
});

// ── GET /api/notes/trending — score = viewsCount*0.6 + downloadsCount*0.4 ────
// NOTE: Must be BEFORE /:id to avoid route collision
router.get('/trending', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 12);

    const trending = await Note.aggregate([
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$viewsCount',     0.6] },
              { $multiply: ['$downloadsCount', 0.4] },
            ],
          },
        },
      },
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from:         'users',
          localField:    'uploadedBy',
          foreignField: '_id',
          as:           'uploadedBy',
        },
      },
      { $unwind: { path: '$uploadedBy', preserveNullAndEmpty: true } },
      {
        $project: {
          title: 1, subject: 1, branch: 1, semester: 1,
          fileUrl: 1, downloadsCount: 1, viewsCount: 1,
          rating: 1, createdAt: 1, score: 1,
          'uploadedBy._id': 1, 'uploadedBy.name': 1,
        },
      },
    ]);

    res.status(200).json(trending);
  } catch (err) {
    console.error('[Trending]', err);
    res.status(500).json({ error: 'Server error fetching trending notes.' });
  }
});

// ── GET /api/notes/public/:id — single note public (for share) ───────────────
router.get('/public/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name');
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.status(200).json(note);
  } catch (err) {
    console.error('[Note GET Public ID]', err);
    res.status(500).json({ error: 'Server error returning note metadata.' });
  }
});

// ── GET /api/notes/:id — single note ─────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.status(200).json(note);
  } catch (err) {
    console.error('[Note GET ID]', err);
    res.status(500).json({ error: 'Server error returning note metadata.' });
  }
});

// ── POST /api/notes/upload — upload PDF ──────────────────────────────────────
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file attached.' });

    const { title, subject, branch, semester } = req.body;
    if (!title || !subject || !branch || !semester) {
      return res.status(400).json({ error: 'title, subject, branch, and semester are required.' });
    }

    // Validate branch against canonical list
    if (!BRANCHES.includes(branch)) {
      return res.status(400).json({ error: `Invalid branch. Must be one of: ${BRANCHES.join(', ')}` });
    }

    const sem = Number(semester);
    if (!sem || sem < 1 || sem > 8) {
      return res.status(400).json({ error: 'Semester must be between 1 and 8.' });
    }

    const newNote = new Note({
      title:      title.trim(),
      subject:    subject.trim(),
      branch,
      semester:   sem,
      uploadedBy: req.user.id,
      fileUrl:    req.file.path,
      public_id:  req.file.filename,
    });

    await newNote.save();
    res.status(201).json({ success: true, note: newNote });
  } catch (err) {
    console.error('[Note Upload]', err);
    res.status(500).json({ error: err.message || 'Server error uploading note.' });
  }
});

// ── DELETE /api/notes/:id — owner OR admin ───────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    const isOwner = note.uploadedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this note.' });
    }

    if (note.public_id) {
      await cloudinary.uploader.destroy(note.public_id, { resource_type: 'raw' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Note deleted successfully.' });
  } catch (err) {
    console.error('[Note Delete]', err);
    res.status(500).json({ error: 'Server error deleting note.' });
  }
});

module.exports = router;
