const Booking = require('../models/Booking');
const Course = require('../models/Course');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { courseId, date, notes } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.availableSlots <= 0) {
            return res.status(400).json({ message: 'No available slots' });
        }

        // Prevent duplicate booking
        const existing = await Booking.findOne({
            user: req.user._id,
            course: courseId,
            status: { $in: ['pending', 'confirmed'] },
        });
        if (existing) {
            return res.status(400).json({ message: 'You have already booked this course' });
        }

        const booking = await Booking.create({
            user: req.user._id,
            course: courseId,
            instructor: course.instructor,
            date,
            notes,
        });

        // Reduce available slots
        course.availableSlots -= 1;
        course.enrolledCount += 1;
        await course.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings for logged-in user
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('course', 'title thumbnail category')
            .populate('instructor', 'name profilePicture')
            .sort({ date: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings received by instructor
// @route   GET /api/bookings/instructor
// @access  Private (Instructor)
const getInstructorBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ instructor: req.user._id })
            .populate('user', 'name email profilePicture')
            .populate('course', 'title')
            .sort({ date: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
const updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const isLearner = booking.user.toString() === req.user._id.toString();
        const isInstructor = booking.instructor.toString() === req.user._id.toString();

        if (!isLearner && !isInstructor) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.status = req.body.status || booking.status;
        const updated = await booking.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getMyBookings, getInstructorBookings, updateBookingStatus };
