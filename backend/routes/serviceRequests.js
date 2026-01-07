import express from 'express';
import { body, validationResult } from 'express-validator';
import ServiceRequest from '../models/ServiceRequest.js';
import upload, { fileToDataUrl } from '../middleware/upload.js';

const router = express.Router();

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

      console.log(`📝 Service request created: ${serviceType} from ${clientName}`);

      res.status(201).json({
        message: 'Service request submitted successfully',
        requestId: serviceRequest._id
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
    .withMessage('Invalid status')
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
