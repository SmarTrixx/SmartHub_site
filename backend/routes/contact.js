// 



import express from 'express';
import { body, validationResult } from 'express-validator';
import { sendEmail } from '../services/emailService.js';
import { emailTemplates } from '../utils/emailTemplates.js';

const router = express.Router();

const sanitize = (s) =>
  s.replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;' }[c])
  ).trim();

router.post(
  '/',
  [
    body('name').notEmpty().isLength({ min: 2 }),
    body('email').isEmail(),
    body('message').notEmpty().isLength({ min: 10 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const name = sanitize(req.body.name);
      const email = req.body.email;
      const message = sanitize(req.body.message);

      const FROM = 'contact.smarthubz@gmail.com';

      /* USER CONFIRMATION */
      const userTemplate = emailTemplates.contactConfirmation(name);
      const userResult = await sendEmail(
        {
          from: FROM,
          to: email,
          subject: userTemplate.subject,
          html: userTemplate.html,
          replyTo: FROM
        },
        'primary'
      );

      /* ADMIN NOTIFICATION */
      const adminTemplate = emailTemplates.contactAdminNotification(name, email, message);
      const adminResult = await sendEmail(
        {
          from: FROM,
          to: FROM,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          replyTo: email
        },
        'primary'
      );

      const emailSent = userResult.success || adminResult.success;

      res.json({
        success: true,
        emailSent,
        message: 'Message received',
        info: emailSent
          ? 'We have received your message and sent a confirmation.'
          : 'Message saved. Email delivery failed, but we will respond.'
      });

    } catch (err) {
      console.error('❌ CONTACT ERROR:', err.message);
      res.status(500).json({ success: false });
    }
  }
);

export default router;
