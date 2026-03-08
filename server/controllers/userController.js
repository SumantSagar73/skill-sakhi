const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update logged-in user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, bio, location, skills, experience, certifications, socialLinks } = req.body;

        user.name = name || user.name;
        user.bio = bio !== undefined ? bio : user.bio;
        user.location = location !== undefined ? location : user.location;
        user.skills = skills || user.skills;
        user.experience = experience !== undefined ? experience : user.experience;
        user.certifications = certifications || user.certifications;
        user.socialLinks = socialLinks || user.socialLinks;

        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            bio: updatedUser.bio,
            location: updatedUser.location,
            skills: updatedUser.skills,
            experience: updatedUser.experience,
            certifications: updatedUser.certifications,
            profilePicture: updatedUser.profilePicture,
            socialLinks: updatedUser.socialLinks,
            rating: updatedUser.rating,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all members
// @route   GET /api/users/members
// @access  Public
const getMembers = async (req, res) => {
    try {
        const members = await User.find({ isActive: true }).select('-password');
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateProfile, getMembers };
