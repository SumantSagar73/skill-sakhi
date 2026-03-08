const express = require('express');
const router = express.Router();
const {
    createCommunity, getCommunities, getCommunityById, joinCommunity, leaveCommunity,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCommunities);
router.get('/:id', getCommunityById);
router.post('/', protect, createCommunity);
router.put('/:id/join', protect, joinCommunity);
router.put('/:id/leave', protect, leaveCommunity);

module.exports = router;
