const express = require('express');
const router = express.Router();
const {
    createCourse, getCourses, getCourseById,
    updateCourse, deleteCourse, getCoursesByInstructor, updateCurriculum,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.get('/instructor/:id', getCoursesByInstructor);
router.get('/:id', getCourseById);
router.post('/', protect, createCourse);
router.put('/:id/curriculum', protect, updateCurriculum);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

module.exports = router;
