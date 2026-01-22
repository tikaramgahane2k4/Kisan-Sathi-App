const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register new farmer
// @access  Public
router.post('/signup', [
  body('name').trim().notEmpty().withMessage('नाम आवश्यक है'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('सही मोबाइल नंबर डालें'),
  body('password').isLength({ min: 6 }).withMessage('पासवर्ड कम से कम 6 अक्षर का होना चाहिए')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, mobile, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'यह मोबाइल नंबर पहले से पंजीकृत है' });
    }

    // Create user
    const user = await User.create({
      name,
      mobile,
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'सर्वर में त्रुटि हुई' });
  }
});

// @route   POST /api/auth/login
// @desc    Login farmer
// @access  Public
router.post('/login', [
  body('mobile').matches(/^[0-9]{10}$/).withMessage('सही मोबाइल नंबर डालें'),
  body('password').notEmpty().withMessage('पासवर्ड आवश्यक है')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile, password } = req.body;

    // Find user
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: 'गलत मोबाइल नंबर या पासवर्ड' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'गलत मोबाइल नंबर या पासवर्ड' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'सर्वर में त्रुटि हुई' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth'), async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      mobile: req.user.mobile
    }
  });
});

module.exports = router;
