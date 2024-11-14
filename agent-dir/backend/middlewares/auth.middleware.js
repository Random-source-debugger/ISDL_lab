// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const config = require('../config/auth.config');

const authMiddleware = {
  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(500).json({ message: 'Authentication error', error: error.message });
    }
  },

  // Check if user is an agent
  isAgent: (req, res, next) => {
    if (req.user.userType !== 'agent') {
      return res.status(403).json({ message: 'Access denied. Agents only.' });
    }
    next();
  },

  // Check if user is a customer
  isCustomer: (req, res, next) => {
    if (req.user.userType !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customers only.' });
    }
    next();
  }
};

module.exports = authMiddleware;