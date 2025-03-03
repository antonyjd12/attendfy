const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
// Update this line to include isSuperAdmin
const { auth, isAdmin, isSuperAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { message: 'Too many login attempts, please try again later' }
});

// Login user with rate limiting
router.post('/login', [
  loginLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').exists().notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    // Find user with consistent field inclusion
    const user = await User.findOne({ email })
      .select('password firstName lastName email role department employeeId isActive')
      .lean()
      .maxTimeMS(5000)
      .exec();
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password with timeout
    const isMatch = await Promise.race([
      bcrypt.compare(password, user.password),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Password verification timeout')), 5000)
      )
    ]).catch(error => {
      console.error('Password verification error:', error);
      return false;
    });

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with expiration
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      },
      process.env.JWT_SECRET
    );

    // Remove sensitive data
    delete user.password;

    // Send response with secure headers
    res.set({
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache'
    }).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
});
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('employeeId').trim().notEmpty(),
  body('department').trim().notEmpty()
];

// Register new user
router.post('/register', [auth, isAdmin, ...registerValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, department, employeeId } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee',
      department,
      employeeId
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add admin registration route (Super Admin only)
// Register admin route
router.post('/register-admin', [auth, isSuperAdmin, ...registerValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, department, employeeId } = req.body;

    // Check if admin already exists with improved error message
    let user = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (user) {
      return res.status(400).json({
        message: user.email === email ? 'Email already registered' : 'Employee ID already exists'
      });
    }

    // Create new admin user with explicit role
    user = new User({
      email,
      password, // Will be hashed by the pre-save middleware with enhanced salt rounds
      firstName,
      lastName,
      department,
      employeeId: employeeId || `ADM${Date.now().toString().slice(-6)}`,
      role: 'admin',
      isActive: true
    });

    // Additional validation for password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    await user.save();
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    // Return user data and token
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during admin registration' });
  }
});
router.post('/register-public', [...registerValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, department, employeeId } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'employee', // Default role for public registration
      department,
      employeeId,
      isActive: true
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Register employee route
router.post('/register-employee', [...registerValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, department, employeeId, assignedAdmin } = req.body;
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (user) {
      return res.status(400).json({
        message: user.email === email ? 'Email already registered' : 'Employee ID already exists'
      });
    }

    // Create new employee user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      department,
      employeeId,
      role: 'employee',
      isActive: true,
      assignedAdmin
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Employee registration error:', error);
    res.status(500).json({ message: 'Server error during employee registration' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.toJSON());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;