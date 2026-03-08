const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getUserProfile, updateProfile, getMembers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) =>
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

router.get('/members', getMembers);
router.get('/:id', getUserProfile);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

module.exports = router;
