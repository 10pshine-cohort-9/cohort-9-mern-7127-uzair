const express = require('express');
const router = express.Router();
const { signup, login, logout, me, updateProfilePicture } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, processAndSaveImage } = require('../middleware/upload');

router.post('/signup',signup);
router.post('/login',login);
router.post('/logout', logout);
router.get('/me',authMiddleware, me);
router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), processAndSaveImage, updateProfilePicture);

module.exports = router;
