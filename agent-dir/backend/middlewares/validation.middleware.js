// middlewares/validation.middleware.js
const { body, validationResult } = require('express-validator');

const validationMiddleware = {
  validateSignup: [
    // Common fields for both customer and agent
    body('fullName')
      .trim()
      .notEmpty().withMessage('Full name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('region')
      .trim()
      .notEmpty().withMessage('Region is required'),
    
    body('district')
      .trim()
      .notEmpty().withMessage('District is required'),
    
    body('phoneNumber')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please enter a valid phone number'),
    
    body('ethereumWalletId')
      .trim()
      .notEmpty().withMessage('Ethereum wallet ID is required')
      .matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Please enter a valid Ethereum wallet address'),

    // Conditional validation for agent-specific fields
    body('specialization')
      .if(body('userType').equals('agent'))
      .notEmpty().withMessage('Specialization is required'),
    
    body('workingDays')
      .if(body('userType').equals('agent'))
      .isArray().withMessage('Working days must be an array')
      .custom((value) => {
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return value.every(day => validDays.includes(day));
      }).withMessage('Invalid working days'),
    
    body('workingHours.start')
      .if(body('userType').equals('agent'))
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:MM)'),
    
    body('workingHours.end')
      .if(body('userType').equals('agent'))
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:MM)')
      .custom((value, { req }) => {
        const start = req.body.workingHours?.start;
        if (start && value) {
          const startTime = new Date(`1970-01-01T${start}`);
          const endTime = new Date(`1970-01-01T${value}`);
          if (endTime <= startTime) {
            throw new Error('End time must be after start time');
          }
        }
        return true;
      }),
    
    body('charges')
      .if(body('userType').equals('agent'))
      .isFloat({ min: 0 }).withMessage('Charges must be a positive number'),

    // Validation result handler
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation error',
          errors: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        });
      }
      next();
    }
  ],

  validateSignin: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Password is required'),

    // Validation result handler
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation error',
          errors: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        });
      }
      next();
    }
  ]
};

module.exports = validationMiddleware;