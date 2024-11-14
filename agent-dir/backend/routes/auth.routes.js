// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateSignup, validateSignin } = require('../middlewares/validation.middleware');

// Sign up routes
router.post(
  '/signup/customer',
  validateSignup,
  (req, res, next) => {
    req.body.userType = 'customer';
    next();
  },
  authController.signup
);

router.post(
  '/signup/agent',
  validateSignup,
  (req, res, next) => {
    req.body.userType = 'agent';
    next();
  },
  authController.signup
);

// Sign in route
router.post('/signin', validateSignin, authController.signin);

module.exports = router;