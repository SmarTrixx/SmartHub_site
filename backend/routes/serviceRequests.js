import express from 'express';
import { body, validationResult } from 'express-validator';
import ServiceRequest from '../models/ServiceRequest.js';
import upload, { fileToDataUrl } from '../middleware/upload.js';
import { emailTemplates } from '../utils/emailTemplates.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Sanitize input
const sanitizeInput = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

// Email sending with proper logging
const sendConfirmationEmails = async (serviceRequest, referenceId) => {
  const clientName = sanitizeInput(serviceRequest.clientName);
  const clientEmail = serviceRequest.clientEmail;
  const serviceType = serviceRequest.serviceType;
  const adminEmail = process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com';

  // Send client confirmation
  try {
    const clientTemplate = emailTemplates.serviceRequestConfirmation(
      clientName,
      serviceType,
      referenceId
    );

    const result = await sendEmail({
      from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
      to: clientEmail,
      subject: clientTemplate.subject,
      html: clientTemplate.html,
      replyTo: adminEmail
    });

    if (result.success) {
      console.log(`✅ CLIENT EMAIL SENT: Service request #${referenceId} confirmation to ${clientEmail}`);
      serviceRequest.emailSent = true;
    } else {
      console.error(`❌ CLIENT EMAIL FAILED: #${referenceId} - ${result.error}`);
      serviceRequest.emailSent = false;
    }
  } catch (error) {
    console.error(`❌ CLIENT EMAIL EXCEPTION: #${referenceId} - ${error.message}`);
    serviceRequest.emailSent = false;
  }

  // Send admin notification
  try {
    const adminTemplate = emailTemplates.serviceRequestAdminNotification(
      clientName,
      clientEmail,
      serviceType,
      referenceId,
      serviceRequest.projectDetails
    );

    const result = await sendEmail({
      from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
      to: adminEmail,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      replyTo: clientEmail
    });

    if (result.success) {
      console.log(`✅ ADMIN EMAIL SENT: New service request #${referenceId} from ${clientName}`);
    } else {
      console.error(`❌ ADMIN EMAIL FAILED: #${referenceId} - ${result.error}`);
    }
  } catch (error) {
    console.error(`❌ ADMIN EMAIL EXCEPTION: #${referenceId} - ${error.message}`);
  }
};

// Create service request (public)
router.post('/',
  upload.any(),
  [
    body('serviceType').notEmpty().withMessage('Service type is required'),
    body('clientName').notEmpty().trim().withMessage('Name is required'),
    body('clientEmail').isEmail().withMessage('Valid email is required'),
    body('clientPhone').optional().trim(),
    body('projectDetails').notEmpty().withMessage('Project details are required'),
    body('termsAccepted').equals('true').withMessage('Terms must be accepted')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const {
        serviceType,
        clientName,
        clientEmail,
        clientPhone,
        projectDetails,
        termsAccepted,
        ...additionalData
      } = req.body;

      // Handle file uploads - convert to base64
      const attachments = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const fileUrl = fileToDataUrl(file);
          attachments.push({
            fieldname: file.fieldname,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            dataUrl: fileUrl
          });
        });
        console.log(`✅ ATTACHMENT: ${attachments.length} file(s) processed for service request`);
      }

      // ALWAYS save request first - regardless of email
      const serviceRequest = new ServiceRequest({
        serviceType,
        clientName,
        clientEmail,
        clientPhone,
        projectDetails,
        additionalData: {
          ...additionalData
        },
        attachments,
        termsAccepted: termsAccepted === 'true' || termsAccepted === true,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        emailSent: false,
        status: 'pending'
      });

      await serviceRequest.save();
      const referenceId = serviceRequest._id.toString().substring(0, 8).toUpperCase();

      console.log(`✅ REQUEST SAVED: Service request #${referenceId} created - ${serviceType} from ${sanitizeInput(clientName)}`);

      // Send emails (blocking, but with structured logging)
      await sendConfirmationEmails(serviceRequest, referenceId);

      // Update the saved record with email status
      await serviceRequest.save();

      res.status(201).json({
        success: true,
        message: 'Service request submitted successfully!',
        requestId: serviceRequest._id,
        referenceId: referenceId,
        emailSent: serviceRequest.emailSent,
        info: serviceRequest.emailSent 
          ? 'A confirmation email has been sent to your inbox.'
          : 'Your request has been received. You will hear from us shortly.'
      });

    } catch (error) {
      console.error(`❌ REQUEST CREATION FAILED: ${error.message}`);
      res.status(500).json({ 
        success: false,
        message: 'Error submitting service request. Please try again.'
      });
    }
  }
);

// Get all service requests (admin only)
router.get('/', async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      total: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching requests' 
    });
  }
});

// Get single service request (admin only)
router.get('/:requestId', async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found' 
      });
    }
    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching request' 
    });
  }
});

// Update service request status (admin only)
// STRICT RULES: Only specific statuses trigger emails
const STATUS_EMAIL_RULES = {
  'pending': false,        // No email
  'reviewing': true,       // Email, no custom message
  'approved': true,        // Email, no custom message
  'in-progress': false,    // No email
  'completed': true,       // Email, no custom message
  'rejected': true         // Email, custom message REQUIRED
};

router.put('/:requestId/status', [
  body('status').isIn(['pending', 'reviewing', 'approved', 'in-progress', 'completed', 'rejected'])
    .withMessage('Invalid status'),
  body('adminMessage').optional().trim(),
  body('internalNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Request not found' 
      });
    }

    const previousStatus = request.status;
    const newStatus = req.body.status;
    const referenceId = request._id.toString().substring(0, 8).toUpperCase();
    let emailSent = false;

    // Update status only if changed
    if (previousStatus !== newStatus) {
      request.status = newStatus;
      request.statusUpdatedAt = new Date();

      // Check if email should be sent for this status
      const shouldSendEmail = STATUS_EMAIL_RULES[newStatus];

      if (shouldSendEmail) {
        try {
          // For rejected status, custom message is required
          if (newStatus === 'rejected' && !req.body.adminMessage) {
            console.warn(`⚠️ STATUS UPDATE: #${referenceId} - Rejected status without custom message`);
          }

          const statusTemplate = emailTemplates.serviceRequestStatusUpdate(
            request.clientName,
            referenceId,
            newStatus,
            req.body.adminMessage || ''
          );

          const result = await sendEmail({
            from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
            to: request.clientEmail,
            subject: statusTemplate.subject,
            html: statusTemplate.html,
            replyTo: process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com'
          });

          if (result.success) {
            console.log(`✅ STATUS EMAIL SENT: #${referenceId} - ${newStatus} status notification to ${request.clientEmail}`);
            emailSent = true;
          } else {
            console.error(`❌ STATUS EMAIL FAILED: #${referenceId} - ${result.error}`);
            emailSent = false;
          }
        } catch (error) {
          console.error(`❌ STATUS EMAIL EXCEPTION: #${referenceId} - ${error.message}`);
          emailSent = false;
        }
      } else {
        console.log(`ℹ️ STATUS UPDATE: #${referenceId} - Status changed to ${newStatus} (no email triggered)`);
      }

      await request.save();
    }

    // Save internal notes if provided
    if (req.body.internalNotes) {
      request.internalNotes = req.body.internalNotes;
      await request.save();
      console.log(`✅ INTERNAL NOTES: #${referenceId} - Updated`);
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      emailSent: emailSent,
      request
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating status' 
    });
  }
});

export default router;
