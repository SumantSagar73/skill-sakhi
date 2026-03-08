const express = require('express');
const router = express.Router();
const { createReview, getCourseReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/:courseId', getCourseReviews);

module.exports = router;
