const Community = require('../models/Community');

// @desc    Create a community group
// @route   POST /api/communities
// @access  Private
const createCommunity = async (req, res) => {
    try {
        const { name, description, category } = req.body;
        const community = await Community.create({
            name,
            description,
            category,
            createdBy: req.user._id,
            members: [req.user._id],
        });
        res.status(201).json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
const getCommunities = async (req, res) => {
    try {
        const communities = await Community.find({ isActive: true })
            .populate('createdBy', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single community
// @route   GET /api/communities/:id
// @access  Public
const getCommunityById = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
            .populate('createdBy', 'name profilePicture')
            .populate('members', 'name profilePicture');
        if (!community) return res.status(404).json({ message: 'Community not found' });
        res.json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a community
// @route   PUT /api/communities/:id/join
// @access  Private
const joinCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (community.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        community.members.push(req.user._id);
        await community.save();
        res.json({ message: 'Joined community successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Leave a community
// @route   PUT /api/communities/:id/leave
// @access  Private
const leaveCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        community.members = community.members.filter(
            (m) => m.toString() !== req.user._id.toString()
        );
        await community.save();
        res.json({ message: 'Left community successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCommunity, getCommunities, getCommunityById, joinCommunity, leaveCommunity };
