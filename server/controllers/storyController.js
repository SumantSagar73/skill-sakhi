const Story = require('../models/Story');

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
exports.createStory = async (req, res) => {
    try {
        const { title, content, coverImage, category, tags } = req.body;

        const story = new Story({
            title,
            content,
            coverImage,
            category,
            tags,
            author: req.user._id, // Assuming auth middleware sets req.user
        });

        const createdStory = await story.save();
        await createdStory.populate('author', 'name profilePicture bio');

        res.status(201).json({
            success: true,
            data: createdStory,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all stories (with filtering, pagination, and sorting)
// @route   GET /api/stories
// @access  Public
exports.getStories = async (req, res) => {
    try {
        const { category, search, sort = 'latest', limit = 10, page = 1 } = req.query;

        const query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'trending') {
            sortOption = { trendingScore: -1, createdAt: -1 };
        } else if (sort === 'popular') {
            sortOption = { views: -1 };
        } else if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const stories = await Story.find(query)
            .populate('author', 'name profilePicture role')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Story.countDocuments(query);

        res.status(200).json({
            success: true,
            count: stories.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: stories,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get top trending stories
// @route   GET /api/stories/trending
// @access  Public
exports.getTrendingStories = async (req, res) => {
    try {
        // Find top 5 stories by trending score or most recent engagement
        const stories = await Story.find({})
            .populate('author', 'name profilePicture')
            .sort({ trendingScore: -1, views: -1, createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: stories,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single story by ID
// @route   GET /api/stories/:id
// @access  Public
exports.getStoryById = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate('author', 'name profilePicture bio socialLinks')
            .populate('comments.user', 'name profilePicture');

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Increment view count
        story.views += 1;
        story.updateTrendingScore(); // Update trending score on view
        await story.save();

        res.status(200).json({
            success: true,
            data: story,
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a story
// @route   PUT /api/stories/:id
// @access  Private
exports.updateStory = async (req, res) => {
    try {
        let story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Check ownership
        if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'User not authorized to update this story' });
        }

        story = await Story.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('author', 'name profilePicture');

        res.status(200).json({
            success: true,
            data: story,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Private
exports.deleteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Check ownership
        if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'User not authorized to delete this story' });
        }

        await story.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Story removed successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Like or Unlike a story
// @route   PUT /api/stories/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Check if the story has already been liked by this user
        const alreadyLiked = story.likes.includes(req.user._id);

        if (alreadyLiked) {
            // Unlike
            story.likes = story.likes.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        } else {
            // Like
            story.likes.push(req.user._id);
        }

        story.updateTrendingScore();
        await story.save();

        res.status(200).json({
            success: true,
            data: story.likes,
            message: alreadyLiked ? 'Story unliked' : 'Story liked'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a comment to a story
// @route   POST /api/stories/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        const newComment = {
            user: req.user._id,
            text,
        };

        story.comments.unshift(newComment);
        story.updateTrendingScore(); // Update trending score when a point of engagement is added
        await story.save();

        // Populate the comment user before returning (we need to find the newly added comment)
        await story.populate('comments.user', 'name profilePicture');

        res.status(201).json({
            success: true,
            data: story.comments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/stories/:id/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Find the comment
        const commentIndex = story.comments.findIndex(
            (c) => c._id.toString() === req.params.commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check ownership (only comment author or story author or admin can delete)
        const comment = story.comments[commentIndex];
        if (
            comment.user.toString() !== req.user._id.toString() &&
            story.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ success: false, message: 'User not authorized to delete this comment' });
        }

        story.comments.splice(commentIndex, 1);

        await story.save();

        res.status(200).json({
            success: true,
            data: story.comments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user's stories
// @route   GET /api/stories/user/:userId
// @access  Public
exports.getUserStories = async (req, res) => {
    try {
        const stories = await Story.find({ author: req.params.userId })
            .populate('author', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: stories.length,
            data: stories,
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
