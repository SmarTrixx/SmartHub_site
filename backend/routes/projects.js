import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import { auth } from '../middleware/auth.js';
import upload, { uploadToCloudinary } from '../middleware/upload.js';

const router = express.Router();

// Get all published projects
router.get('/', async (req, res) => {
  try {
    const { tag, search, page = 1, limit = 10 } = req.query;
    
    let filter = { status: 'published' };
    
    if (tag) {
      filter.tags = tag;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ featured: -1, createdAt: -1 });

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get single project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findOne({
      id: req.params.projectId,
      status: 'published'
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Increment view count
    project.viewCount += 1;
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Create project (admin only)
router.post('/',
  auth,
  upload.array('images', 10),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('desc').notEmpty().withMessage('Short description is required'),
    body('fullDescription').notEmpty().withMessage('Full description is required'),
    body('challenge').notEmpty().withMessage('Challenge is required'),
    body('solution').notEmpty().withMessage('Solution is required'),
    body('client').notEmpty().withMessage('Client name is required'),
    body('year').isInt({ min: 1900 }).withMessage('Valid year is required'),
    body('tags').notEmpty().withMessage('At least one tag is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'At least one image is required' });
      }

      const {
        id, title, desc, fullDescription, challenge, solution,
        client, year, tags, tools, link, status = 'published'
      } = req.body;

      // Check if project ID already exists
      const existingProject = await Project.findOne({ id });
      if (existingProject) {
        return res.status(400).json({ message: 'Project ID already exists' });
      }

      // Upload images - use Cloudinary on production/Vercel
      let imagePaths;
      try {
        if (process.env.VERCEL || process.env.CLOUDINARY_CLOUD_NAME) {
          // Upload to Cloudinary on production/Vercel
          imagePaths = await Promise.all(req.files.map(file => uploadToCloudinary(file)));
          console.log('✅ Project images uploaded to Cloudinary');
        } else {
          // Use local paths in development
          imagePaths = req.files.map(file => `/uploads/${file.filename}`);
          console.log('📁 Project images saved locally');
        }
      } catch (err) {
        console.error('❌ Error uploading project images:', err);
        return res.status(400).json({ message: 'Failed to upload images: ' + err.message });
      }

      const newProject = new Project({
        id,
        title,
        desc,
        fullDescription,
        challenge,
        solution,
        image: imagePaths[0],
        images: imagePaths,
        tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags,
        tools: typeof tools === 'string' ? tools.split(',').map(t => t.trim()) : tools || [],
        client,
        year: parseInt(year),
        link,
        status
      });

      await newProject.save();

      res.status(201).json({
        message: 'Project created successfully',
        project: newProject
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Error creating project', error: error.message });
    }
  }
);

// Update project (admin only)
router.put('/:projectId',
  auth,
  upload.array('images', 10),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('client').notEmpty().withMessage('Client name is required'),
    body('year').isInt({ min: 1900 }).withMessage('Valid year is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const project = await Project.findOne({ id: req.params.projectId });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const {
        title, desc, fullDescription, challenge, solution,
        client, year, tags, tools, link, status
      } = req.body;

      // Update fields
      if (title) project.title = title;
      if (desc) project.desc = desc;
      if (fullDescription) project.fullDescription = fullDescription;
      if (challenge) project.challenge = challenge;
      if (solution) project.solution = solution;
      if (client) project.client = client;
      if (year) project.year = parseInt(year);
      if (link) project.link = link;
      if (status) project.status = status;
      if (tags) {
        project.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }
      if (tools) {
        project.tools = typeof tools === 'string' ? tools.split(',').map(t => t.trim()) : tools;
      }

      // Update images if new ones provided
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        project.images = newImages;
        project.image = newImages[0];
      }

      await project.save();

      res.json({
        message: 'Project updated successfully',
        project
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Error updating project' });
    }
  }
);

// Delete project (admin only)
router.delete('/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ id: req.params.projectId });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project deleted successfully',
      project
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;
