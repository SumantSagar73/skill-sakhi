const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, default: '' },   // YouTube URL pasted by instructor
    duration: { type: String, default: '' },   // e.g. "10 min"
    isFree: { type: Boolean, default: false }, // preview without enrollment
    order: { type: Number, default: 0 },
}, { _id: true });

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    topics: [topicSchema],
}, { _id: true });

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'Cooking',
                'Technology',
                'Art & Design',
                'Business',
                'Fitness',
                'Language',
                'Handicrafts',
                'Digital Marketing',
                'Other',
            ],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        duration: {
            type: String,
            required: [true, 'Duration is required'],
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        availableSlots: {
            type: Number,
            default: 10,
        },
        enrolledCount: {
            type: Number,
            default: 0,
        },
        thumbnail: {
            type: String,
            default: '',
        },
        tags: [{ type: String }],
        meetingLink: {
            type: String,
            default: '',
        },
        modules: {
            type: [moduleSchema],
            default: [],
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        rating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
