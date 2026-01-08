import express from 'express';
import { body, validationResult } from 'express-validator';
import { sendEmail, sendEmailAsync } from '../services/emailService.js';
import { emailTemplates } from '../utils/emailTemplates.js';

const router = express.Router();

// Root endpoint for /api/contact
router.get('/', (req, res) => {
  res.json({
    message: 'Contact API',
    endpoints: ['POST / - Submit contact form']
  });
});

// Sanitize input to prevent XSS
const sanitizeInput = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// POST /api/contact - Submit contact form
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters')
  ],
  async (req, res) => {
    try {
      // Validate request body
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

      // Log contact submission
      console.log(`📝 Contact submission: ${sanitizedName} (${email})`);

      // Send user confirmation email (async, non-blocking)
      const userTemplate = emailTemplates.contactConfirmation(sanitizedName);
      sendEmailAsync({
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: email,
        subject: userTemplate.subject,
        html: userTemplate.html,
        replyTo: process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com'
      });

      // Send admin notification email (async, non-blocking)
      const adminTemplate = emailTemplates.contactAdminNotification(sanitizedName, email, sanitizedMessage);
      sendEmailAsync({
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com',
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        replyTo: email
      });

      // Return success immediately - emails are sent async
      res.status(200).json({
        success: true,
        message: 'Message submitted successfully',
        info: 'We will contact you shortly. A confirmation email has been sent.'
      });

    } catch (error) {
      console.error('❌ CONTACT FORM ERROR:', error.message);

      // Return 500 only for critical errors, not email failures
      return res.status(500).json({
        success: false,
        message: 'Failed to process your message. Please try again later.'
      });
    }
  }
);

export default router;
