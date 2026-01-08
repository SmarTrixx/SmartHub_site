import express from 'express';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import ServiceRequest from '../models/ServiceRequest.js';
import upload, { fileToDataUrl } from '../middleware/upload.js';
import { emailTemplates } from '../utils/emailTemplates.js';

const router = express.Router();

// Email transporter
let transporter = null;
const initializeTransporter = async () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        pass: process.env.GMAIL_PASSWORD || ''
      },
      pool: {
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 4000,
        rateLimit: 14
      }
    });
    
    transporter.verify((error) => {
      if (!error) console.log('✅ Email service ready for service requests');
    });
  }
  return transporter;
};

initializeTransporter();

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
        return res.status(400).json({ errors: errors.array() });
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
        req.files.forEach((file, idx) => {
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
        userAgent: req.get('user-agent')
      });

      await serviceRequest.save();

      // Generate reference ID (use first 8 chars of MongoDB ID)
      const referenceId = serviceRequest._id.toString().substring(0, 8).toUpperCase();

      // Send confirmation email to client (non-blocking)
      const mail = await initializeTransporter();
      if (mail) {
        const clientTemplate = emailTemplates.serviceRequestConfirmation(sanitizeInput(clientName), serviceType, referenceId);
        mail.sendMail({
          from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
          to: clientEmail,
          subject: clientTemplate.subject,
          html: clientTemplate.html
        }).catch(err => {
          console.error('⚠️  Failed to send client confirmation:', err.message);
        });

        // Send admin notification
        mail.sendMail({
          from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
          to: process.env.ADMIN_EMAIL || 'contact.smarthubz@gmail.com',
          subject: `New Service Request #${referenceId} - ${serviceType}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>New Service Request Submitted</h2>
              <p><strong>Reference ID:</strong> ${referenceId}</p>
              <p><strong>Service Type:</strong> ${serviceType}</p>
              <p><strong>Client Name:</strong> ${sanitizeInput(clientName)}</p>
              <p><strong>Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
              <p><strong>Phone:</strong> ${clientPhone || 'Not provided'}</p>
              <hr>
              <h3>Project Details:</h3>
              <p>${sanitizeInput(projectDetails).replace(/\n/g, '<br>')}</p>
              <p><a href="${process.env.FRONTEND_URL || 'https://smarthubz.vercel.app'}/admin/service-requests">View in Admin Panel</a></p>
            </div>
          `,
          replyTo: clientEmail
        }).catch(err => {
          console.error('⚠️  Failed to send admin notification:', err.message);
        });
      }

      console.log(`📝 Service request created: ${serviceType} from ${clientName} (ID: ${referenceId})`);

      res.status(201).json({
        message: 'Service request submitted successfully',
        requestId: serviceRequest._id,
        referenceId: referenceId
      });
    } catch (error) {
      console.error('Error creating service request:', error);
      res.status(500).json({ message: 'Error submitting service request', error: error.message });
    }
  }
);

// Get all service requests (admin only)
router.get('/', async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .select('-attachments.dataUrl') // Exclude large base64 data in list
      .sort({ createdAt: -1 });
    
    res.json({
      total: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get single service request (admin only)
router.get('/:requestId', async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({ message: 'Error fetching request' });
  }
});

// Update service request status (admin only)
router.put('/:requestId/status', [
  body('status').isIn(['pending', 'reviewing', 'approved', 'in-progress', 'completed', 'rejected'])
    .withMessage('Invalid status'),
  body('message').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        status: req.body.status,
        statusUpdatedAt: new Date()
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Send status update email to client
    const mail = await initializeTransporter();
    if (mail) {
      const referenceId = request._id.toString().substring(0, 8).toUpperCase();
      const statusTemplate = emailTemplates.serviceRequestStatusUpdate(
        request.clientName,
        referenceId,
        req.body.status,
        sanitizeInput(req.body.message || '')
      );
      
      mail.sendMail({
        from: process.env.GMAIL_USER || 'contact.smarthubz@gmail.com',
        to: request.clientEmail,
        subject: statusTemplate.subject,
        html: statusTemplate.html
      }).catch(err => {
        console.error('⚠️  Failed to send status update email:', err.message);
      });
    }

    console.log(`📧 Status update email sent to ${request.clientEmail} for request #${req.params.requestId}`);

    res.json({
      message: 'Status updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});

export default router;
