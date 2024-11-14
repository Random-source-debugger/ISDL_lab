// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const { User, Customer, Agent } = require('../models/user.model');
const config = require('../config/auth.config');

class AuthController {
  // Sign up controller for both customer and agent
  async signup(req, res) {
    try {
      const { userType, ...userData } = req.body;
      
      // Validate user type
      if (!['customer', 'agent'].includes(userType)) {
        return res.status(400).json({ message: 'Invalid user type' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create user based on type
      let user;
      if (userType === 'customer') {
        user = new Customer(userData);
      } else {
        user = new Agent(userData);
      }

      // Save user
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, userType },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      // Prepare response object (excluding sensitive data)
      const userResponse = {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        userType,
        region: user.region,
        district: user.district
      };

      // Add agent-specific fields to response if user is an agent
      if (userType === 'agent') {
        Object.assign(userResponse, {
          specialization: user.specialization,
          workingDays: user.workingDays,
          workingHours: user.workingHours,
          charges: user.charges
        });
      }

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userResponse
      });

    } catch (error) {
      res.status(500).json({
        message: 'Error registering user',
        error: error.message
      });
    }
  }

  // Sign in controller
  async signin(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id, userType: user.userType },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      // Prepare response object (excluding sensitive data)
      const userResponse = {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        region: user.region,
        district: user.district
      };

      // Add agent-specific fields to response if user is an agent
      if (user.userType === 'agent') {
        Object.assign(userResponse, {
          specialization: user.specialization,
          workingDays: user.workingDays,
          workingHours: user.workingHours,
          charges: user.charges,
          rating: user.rating
        });
      }

      res.json({
        message: 'Signed in successfully',
        token,
        user: userResponse
      });

    } catch (error) {
      res.status(500).json({
        message: 'Error signing in',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();