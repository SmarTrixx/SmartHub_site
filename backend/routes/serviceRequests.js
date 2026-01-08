import express from 'express';
import { body, validationResult } from 'express-validator';
import ServiceRequest from '../models/ServiceRequest.js';
import upload, { fileToDataUrl } from '../middleware/upload.js';
import { emailTemplates } from '../utils/emailTemplates.js';
import { sendEmailAsync } from '../services/emailService.js';

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
        console.log(`✅ Attached ${attachments.length} files to service request`);
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
        emailSent: false // Track if confirmation email was sent
      });

      await serviceRequest.save();
      const referenceId = serviceRequest._id.toString().substring(0, 8).toUpperCase();

      console.log(`📝 Service request saved: ${serviceType} from ${clientName} (ID: ${referenceId})`);

      // Send emails asynchronously (non-blocking)
      const clientTemplate = emailTemplates.serviceRequestConfirmation(
        sanitizeInput(clientName), 
        serviceType, 
        referenceId
      );

      sendEmailAsync({
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: clientEmail,
        subject: clientTemplate.subject,
        html: clientTemplate.html,
        replyTo: process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com'
      });

      // Send admin notification
      sendEmailAsync({
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com',
        subject: `New Service Request #${referenceId} - ${serviceType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #0057FF;">New Service Request Submitted</h2>
            <div style="background: white; padding: 15px; border-left: 4px solid #0057FF; margin: 15px 0;">
              <p><strong>Reference ID:</strong> <code>${referenceId}</code></p>
              <p><strong>Service Type:</strong> ${serviceType}</p>
              <p><strong>Client Name:</strong> ${sanitizeInput(clientName)}</p>
              <p><strong>Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
              <p><strong>Phone:</strong> ${clientPhone || 'Not provided'}</p>
            </div>
            <h3>Project Details:</h3>
            <p>${sanitizeInput(projectDetails).replace(/\n/g, '<br>')}</p>
            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'https://smarthubz.vercel.app'}/admin/service-requests" style="background: #0057FF; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block;">
                View in Admin Panel
              </a>
            </p>
          </div>
        `,
        replyTo: clientEmail
      });

      // Return success - emails sent async
      res.status(201).json({
        success: true,
        message: 'Service request submitted successfully!',
        requestId: serviceRequest._id,
        referenceId: referenceId,
        info: 'A confirmation email has been sent to your inbox.'
      });

    } catch (error) {
      console.error('❌ Error creating service request:', error.message);
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
      .select('-attachments.dataUrl')
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

    // Update status only if changed
    if (previousStatus !== newStatus) {
      request.status = newStatus;
      request.statusUpdatedAt = new Date();
      await request.save();

      // Send email async
      const referenceId = request._id.toString().substring(0, 8).toUpperCase();
      const statusTemplate = emailTemplates.serviceRequestStatusUpdate(
        request.clientName,
        referenceId,
        newStatus,
        req.body.adminMessage || ''
      );

      sendEmailAsync({
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: request.clientEmail,
        subject: statusTemplate.subject,
        html: statusTemplate.html,
        replyTo: process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com'
      });
    }

    // Save internal notes if provided
    if (req.body.internalNotes) {
      request.internalNotes = req.body.internalNotes;
      await request.save();
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
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
