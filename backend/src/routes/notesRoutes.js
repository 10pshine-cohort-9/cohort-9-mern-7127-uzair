const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createNote, getNotes, updateNote, deleteNote, getTrash, restoreNote, permanentlyDeleteNote } = require('../controllers/noteController');

router.post('/', authMiddleware, createNote);
router.get('/', authMiddleware, getNotes);
router.put('/:id', authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);
router.get('/trash', authMiddleware, getTrash);
router.patch('/:id/restore', authMiddleware, restoreNote);
router.delete('/:id/permanent', authMiddleware, permanentlyDeleteNote);

module.exports = router;