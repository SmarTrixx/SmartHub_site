import express from 'express';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import { emailTemplates } from '../utils/emailTemplates.js';

const router = express.Router();

// Root endpoint for /api/contact
router.get('/', (req, res) => {
  res.json({
    message: 'Contact API',
    endpoints: [
      'POST / - Submit contact form'
    ]
  });
});

// Email transporter with connection pooling
let transporter = null;
let transporterReady = false;

const initializeTransporter = async () => {
  if (!transporter) {
    const gmailUser = process.env.GMAIL_USER || 'contact.smarthubz@gmail.com';
    const gmailPass = process.env.GMAIL_PASSWORD || '';

    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: gmailUser,
        pass: gmailPass
      },
      pool: {
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 4000,
        rateLimit: 14
      }
    });

    // Verify connection (non-blocking)
    transporter.verify((error, success) => {
      if (error) {
        console.warn('⚠️  Email transporter verification failed:', error.message);
        transporterReady = false;
      } else {
        console.log('✅ Email transporter ready');
        transporterReady = true;
      }
    });
  }
  return transporter;
};

// Initialize on startup
initializeTransporter();

// Sanitize user input to prevent injection
const sanitizeInput = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// POST /api/contact - Send contact form email
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
        });
      }

      const { name, email, message } = req.body;
      const sanitizedName = sanitizeInput(name);
      const sanitizedMessage = sanitizeInput(message);

      // Get mail transporter
      const mail = await initializeTransporter();

      if (!mail) {
        return res.status(503).json({
          success: false,
          message: 'Email service temporarily unavailable. Please try again later.'
        });
      }

      // Get email templates
      const userTemplate = emailTemplates.contactConfirmation(sanitizedName);
      const adminTemplate = emailTemplates.contactAdminNotification(sanitizedName, email, sanitizedMessage);

      // Send user confirmation email (non-blocking)
      mail.sendMail({
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: email,
        subject: userTemplate.subject,
        html: userTemplate.html
      }).catch(err => {
        console.error('❌ Failed to send user confirmation email:', err.message);
        // Don't fail the response - this is secondary
      });

      // Send admin notification email
      await mail.sendMail({
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com',
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        replyTo: email
      });

      res.status(200).json({
        success: true,
        message: 'Message sent successfully! We will contact you shortly.',
        info: 'A confirmation email has been sent to your inbox.'
      });

    } catch (error) {
      console.error('❌ Error in contact form submission:', {
        message: error.message,
        code: error.code,
        statusCode: error.responseCode
      });

      // Different error handling based on error type
      if (error.code === 'EAUTH') {
        return res.status(503).json({
          success: false,
          message: 'Email service authentication failed. Please try again later.'
        });
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
          success: false,
          message: 'Email service connection failed. Please try again later.'
        });
      }

      // Generic server error (production-safe)
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later or contact us directly.',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      });
    }
  }
);

export default router;
