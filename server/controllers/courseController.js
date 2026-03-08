const Course = require('../models/Course');

// Extract YouTube video ID from any YouTube URL format
const extractYouTubeId = (url = '') => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
};

// Auto-generate thumbnail from first video in modules if no thumbnail set
const autoThumbnail = (modules = []) => {
    for (const mod of modules) {
        for (const topic of (mod.topics || [])) {
            const id = extractYouTubeId(topic.videoUrl);
            if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        }
    }
    return '';
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Instructor)
const createCourse = async (req, res) => {
    try {
        let { title, description, category, price, duration, level, availableSlots, tags, meetingLink, thumbnail, modules } = req.body;

        // modules may arrive as JSON string when sent via FormData
        if (typeof modules === 'string') {
            try { modules = JSON.parse(modules); } catch { modules = []; }
        }

        // Auto-assign thumbnail from first YouTube video if none provided
        if (!thumbnail && modules?.length) {
            thumbnail = autoThumbnail(modules);
        }

        const course = await Course.create({
            title,
            description,
            category,
            price,
            duration,
            level,
            availableSlots,
            tags,
            meetingLink,
            thumbnail: thumbnail || '',
            modules: modules || [],
            instructor: req.user._id,
            isApproved: true, // auto-approve until admin panel is built
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all approved courses with search & filter
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    try {
        const { keyword, category, level, minPrice, maxPrice, sort } = req.query;
        const query = { isApproved: true, isActive: true };

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { tags: { $regex: keyword, $options: 'i' } },
            ];
        }
        if (category) query.category = category;
        if (level) query.level = level;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };

        const courses = await Course.find(query)
            .populate('instructor', 'name profilePicture rating')
            .sort(sortOption);

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate(
            'instructor',
            'name bio profilePicture rating skills experience'
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Instructor - owner)
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        Object.assign(course, req.body);
        if (req.file) course.thumbnail = `/uploads/${req.file.filename}`;

        const updated = await course.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor - owner or Admin)
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const isOwner = course.instructor.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await course.deleteOne();
        res.json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get courses by instructor
// @route   GET /api/courses/instructor/:id
// @access  Public
const getCoursesByInstructor = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.params.id, isActive: true })
            .populate('instructor', 'name profilePicture rating');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Replace course curriculum (modules + topics)
// @route   PUT /api/courses/:id/curriculum
// @access  Private (Instructor - owner)
const updateCurriculum = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { modules } = req.body;
        course.modules = modules || [];

        // Refresh auto-thumbnail if original was auto-generated from YouTube
        if (!course.thumbnail || course.thumbnail.includes('img.youtube.com')) {
            course.thumbnail = autoThumbnail(course.modules) || course.thumbnail;
        }

        const updated = await course.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCourse, getCourses, getCourseById, updateCourse, deleteCourse, getCoursesByInstructor, updateCurriculum };
