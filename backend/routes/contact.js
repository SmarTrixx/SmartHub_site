import express from 'express';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Create transporter function that will be called lazily
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const gmailUser = process.env.GMAIL_USER || 'contact.smarthubz@gmail.com';
    const gmailPass = process.env.GMAIL_PASSWORD || '';

    console.log('📧 Creating email transporter with user:', gmailUser);
    console.log('📧 Password length:', gmailPass.length, 'chars');

    if (!gmailPass) {
      console.warn('⚠️  WARNING: GMAIL_PASSWORD is not set in environment variables!');
    }

    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });

    // Verify transporter connection (non-blocking)
    transporter.verify((error, success) => {
      if (error) {
        console.log('❌ Email transporter error:', error.message);
        console.log('   Code:', error.code);
      } else {
        console.log('✅ Email transporter ready');
      }
    });
  }
  return transporter;
};

// POST /api/contact - Send contact form email
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, message } = req.body;

      // Email to admin
      const adminMailOptions = {
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: 'contact.smarthubz@gmail.com',
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <h2>New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><em>Reply to: ${email}</em></p>
        `
      };

      // Auto-reply email to user
      const userMailOptions = {
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: email,
        subject: 'We received your message - SmartHub',
        html: `
          <h2>Thank you for contacting SmartHub!</h2>
          <p>Hi ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <hr>
          <p><strong>Your Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>Best regards,<br>SmartHub Team</p>
        `
      };

      // Send emails
      const mail = getTransporter();
      await mail.sendMail(adminMailOptions);
      await mail.sendMail(userMailOptions);

      res.status(200).json({
        success: true,
        message: 'Message sent successfully! We will contact you shortly.'
      });
    } catch (error) {
      console.error('❌ Error sending email:', {
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response,
        fullError: error
      });
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        details: process.env.NODE_ENV === 'development' ? error.code : undefined
      });
    }
  }
);

export default router;
