import express from 'express';
import { body, validationResult } from 'express-validator';
import Service from '../models/Service.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all services - returns all if admin, only active if public
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const isAdmin = authHeader && authHeader.startsWith('Bearer ');
    
    let query = isAdmin ? {} : { status: 'active' };
    const services = await Service.find(query).sort({ order: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Get single service
router.get('/:serviceId', async (req, res) => {
  try {
    const service = await Service.findOne({
      id: req.params.serviceId,
      status: 'active'
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Error fetching service' });
  }
});

// Create service (admin only)
router.post('/',
  auth,
  [
    body('id').notEmpty().withMessage('Service ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, title, description, icon, features, price, status, order } = req.body;

      // Check if service ID exists
      const existingService = await Service.findOne({ id });
      if (existingService) {
        return res.status(400).json({ message: 'Service ID already exists' });
      }

      const newService = new Service({
        id,
        title,
        description,
        icon,
        features: typeof features === 'string' ? features.split(',').map(f => f.trim()) : features || [],
        price,
        status,
        order
      });

      await newService.save();

      res.status(201).json({
        message: 'Service created successfully',
        service: newService
      });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ message: 'Error creating service' });
    }
  }
);

// Update service (admin only)
router.put('/:serviceId',
  auth,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const service = await Service.findOne({ id: req.params.serviceId });
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      const { title, description, icon, features, price, status, order } = req.body;

      if (title) service.title = title;
      if (description) service.description = description;
      if (icon) service.icon = icon;
      if (price) service.price = price;
      if (status) service.status = status;
      if (order !== undefined) service.order = order;
      if (features) {
        service.features = typeof features === 'string' ? features.split(',').map(f => f.trim()) : features;
      }

      await service.save();

      res.json({
        message: 'Service updated successfully',
        service
      });
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ message: 'Error updating service' });
    }
  }
);

// Delete service (admin only)
router.delete('/:serviceId', auth, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ id: req.params.serviceId });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      message: 'Service deleted successfully',
      service
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service' });
  }
});

export default router;
