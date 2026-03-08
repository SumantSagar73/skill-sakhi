const Post = require('../models/Post');
const Community = require('../models/Community');

// @desc    Create a post in a community
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { communityId, content } = req.body;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const isMember = community.members.includes(req.user._id.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Join the community to post' });
        }

        const post = await Post.create({
            community: communityId,
            author: req.user._id,
            content,
            image: req.file ? `/uploads/${req.file.filename}` : '',
        });

        const populated = await post.populate('author', 'name profilePicture');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get posts in a community
// @route   GET /api/posts/:communityId
// @access  Public
const getCommunityPosts = async (req, res) => {
    try {
        const posts = await Post.find({ community: req.params.communityId })
            .populate('author', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const liked = post.likes.includes(req.user._id);
        if (liked) {
            post.likes = post.likes.filter((l) => l.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json({ likes: post.likes.length, liked: !liked });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({ user: req.user._id, text: req.body.text });
        await post.save();
        await post.populate('comments.user', 'name profilePicture');
        res.status(201).json(post.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPost, getCommunityPosts, likePost, addComment };
