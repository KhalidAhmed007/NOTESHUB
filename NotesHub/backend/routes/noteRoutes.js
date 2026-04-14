const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../config/cloudinary');

// GET /api/notes — all notes with search/filter
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, branch, semester, subject } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch && branch !== 'All') query.branch = branch;
    if (semester && semester !== 'All') query.semester = Number(semester);
    if (subject) query.subject = subject;

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching notes.' });
  }
});

// GET /api/notes/:id — single note
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.status(200).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error returning note metadata.' });
  }
});

// POST /api/notes/upload — upload note PDF
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file attached.' });

    const { title, subject, branch, semester } = req.body;
    if (!title || !subject || !branch || !semester) {
      return res.status(400).json({ error: 'title, subject, branch, and semester are required.' });
    }

    const newNote = new Note({
      title,
      subject,
      branch,
      semester: Number(semester),
      uploadedBy: req.user.id,          // use req.user.id (structured object)
      fileUrl: req.file.path,
      public_id: req.file.filename,
    });

    await newNote.save();
    res.status(201).json({ success: true, note: newNote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error uploading note.' });
  }
});

// DELETE /api/notes/:id — owner OR admin can delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    const isOwner = note.uploadedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    console.log(`[Delete] noteOwner: ${note.uploadedBy} | requester: ${req.user.id} | role: ${req.user.role}`);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this note.' });
    }

    // Delete from Cloudinary
    if (note.public_id) {
      await cloudinary.uploader.destroy(note.public_id, { resource_type: 'raw' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Note deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting note.' });
  }
});

module.exports = router;
