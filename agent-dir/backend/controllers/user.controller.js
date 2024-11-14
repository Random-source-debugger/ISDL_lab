// controllers/user.controller.js
const { User, Customer, Agent } = require('../models/user.model');

class UserController {
  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile' });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const updates = { ...req.body };
      
      // Remove fields that shouldn't be updated
      delete updates.password;
      delete updates.email;
      delete updates.userType;

      // Additional fields for agents
      if (req.user.userType === 'agent') {
        const allowedUpdates = [
          'fullName', 'region', 'district', 'phoneNumber', 
          'specialization', 'workingDays', 'workingHours', 'charges'
        ];
        Object.keys(updates).forEach(key => {
          if (!allowedUpdates.includes(key)) delete updates[key];
        });
      } else {
        // Fields for customers
        const allowedUpdates = ['fullName', 'region', 'district', 'phoneNumber'];
        Object.keys(updates).forEach(key => {
          if (!allowedUpdates.includes(key)) delete updates[key];
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating profile',
        error: error.message 
      });
    }
  }

  // Update user password
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating password',
        error: error.message 
      });
    }
  }

  // Get agent profile by ID (public route)
  async getAgentProfile(req, res) {
    try {
      const agent = await Agent.findById(req.params.id)
        .select('-password -email');

      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }

      res.json({ agent });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching agent profile',
        error: error.message 
      });
    }
  }
}

module.exports = new UserController();