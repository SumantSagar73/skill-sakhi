const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Story content is required'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        coverImage: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: ['career', 'entrepreneurship', 'education', 'personal-growth', 'other'],
            default: 'other',
        },
        tags: [{
            type: String,
            trim: true
        }],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
        trendingScore: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true }
);

// Virtual for comment count
storySchema.virtual('commentCount').get(function () {
    return this.comments.length;
});

// Calculate trending score based on likes, comments, and views (can be scheduled or updated on interactions)
storySchema.methods.updateTrendingScore = function () {
    const likeWeight = 2;
    const commentWeight = 3;
    const viewWeight = 0.5;

    // Time decay factor (older stories drop in score)
    const ageInDays = (Date.now() - this.createdAt.getTime()) / (1000 * 3600 * 24);
    const timeDecay = Math.max(1, ageInDays);

    this.trendingScore = ((this.likes.length * likeWeight) + (this.comments.length * commentWeight) + (this.views * viewWeight)) / timeDecay;
};

module.exports = mongoose.model('Story', storySchema);
