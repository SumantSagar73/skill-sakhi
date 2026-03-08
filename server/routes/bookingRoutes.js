const express = require('express');
const router = express.Router();
const {
    createBooking, getMyBookings, getInstructorBookings, updateBookingStatus, getCourseEnrollments,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/instructor', protect, getInstructorBookings);
router.get('/course/:courseId', protect, getCourseEnrollments);
router.put('/:id', protect, updateBookingStatus);

module.exports = router;
