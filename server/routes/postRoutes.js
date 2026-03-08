const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createPost, getCommunityPosts, likePost, addComment } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) =>
        cb(null, `post-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

router.get('/:communityId', getCommunityPosts);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;
