const express = require('express');
const router = express.Router();
const {
    createStory,
    getStories,
    getTrendingStories,
    getStoryById,
    updateStory,
    deleteStory,
    toggleLike,
    addComment,
    deleteComment,
    getUserStories
} = require('../controllers/storyController');

const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getStories);
router.get('/trending', getTrendingStories);
router.get('/:id', getStoryById);
router.get('/user/:userId', getUserStories);

// Protected routes
router.post('/', protect, createStory);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
