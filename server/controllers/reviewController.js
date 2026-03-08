const Review = require('../models/Review');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const review = await Review.create({
            user: req.user._id,
            course: courseId,
            instructor: course.instructor,
            rating,
            comment,
        });

        // Update course rating
        const allReviews = await Review.find({ course: courseId });
        const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
        course.rating = Math.round(avg * 10) / 10;
        course.totalReviews = allReviews.length;
        await course.save();

        // Update instructor rating
        const instructorReviews = await Review.find({ instructor: course.instructor });
        const instrAvg = instructorReviews.reduce((acc, r) => acc + r.rating, 0) / instructorReviews.length;
        await User.findByIdAndUpdate(course.instructor, {
            rating: Math.round(instrAvg * 10) / 10,
            totalReviews: instructorReviews.length,
        });

        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this course' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a course
// @route   GET /api/reviews/:courseId
// @access  Public
const getCourseReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ course: req.params.courseId })
            .populate('user', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReview, getCourseReviews };
