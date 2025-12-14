import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Root endpoint for /api/auth
router.get('/', (req, res) => {
  res.json({
    message: 'Auth API',
    endpoints: [
      'GET /setup - Check setup status',
      'POST /setup - Create default admin',
      'POST /login - Login with credentials',
      'POST /register - Register new admin',
      'GET /verify - Verify token',
      'POST /logout - Logout'
    ]
  });
});

// Setup - Create default admin if none exists
router.get('/setup', async (req, res) => {
  res.json({ 
    message: 'Setup endpoint - use POST to create default admin',
    method: 'POST',
    endpoint: '/api/auth/setup'
  });
});

router.post('/setup', async (req, res) => {
  try {
    // Wait for MongoDB to connect (up to 30 seconds)
    let attempts = 0;
    while (attempts < 30 && mongoose.connection.readyState !== 1) {
      console.log(`⏳ Waiting for MongoDB... (attempt ${attempts + 1}/30)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'MongoDB connection timeout',
        error: 'Could not establish MongoDB connection after 30 seconds'
      });
    }

    // Check if any admin exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin already exists. Cannot run setup again.',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      });
    }

    // Create default admin
    const admin = new Admin({
      email: 'admin@smarthub.com',
      password: 'demo123456',
      name: 'Admin User',
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      message: 'Default admin account created successfully',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      nextSteps: 'Use these credentials to login: admin@smarthub.com / demo123456'
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ message: 'Error during setup', error: error.message });
  }
});

// Register (admin setup - ideally only done once)
router.post('/register', 
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if admin already exists
      let admin = await Admin.findOne({ email });
      if (admin) {
        return res.status(400).json({ message: 'Admin already registered with this email' });
      }

      // Create new admin
      admin = new Admin({
        email,
        password,
        name,
        role: 'admin'
      });

      await admin.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Admin registered successfully',
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find admin and include password field
      const admin = await Admin.findOne({ email }).select('+password');
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(403).json({ message: 'Admin account is disabled' });
      }

      // Compare passwords
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        admin.loginAttempts += 1;
        if (admin.loginAttempts >= 5) {
          admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        }
        await admin.save();
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Reset login attempts on successful login
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      admin.lastLogin = new Date();
      await admin.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// Verify token
router.get('/verify', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying token' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout' });
  }
});

export default router;
