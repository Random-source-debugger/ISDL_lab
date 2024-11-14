// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

// Validation middleware for password update
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Profile routes (protected)
router.get(
  '/profile',
  authMiddleware.verifyToken,
  userController.getProfile
);

router.put(
  '/profile',
  authMiddleware.verifyToken,
  userController.updateProfile
);

router.put(
  '/password',
  authMiddleware.verifyToken,
  validatePasswordUpdate,
  userController.updatePassword
);

// Public routes
router.get(
  '/agents/:id',
  userController.getAgentProfile
);

module.exports = router;