import express from 'express';
import { body, validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import { auth } from '../middleware/auth.js';
import upload, { fileToDataUrl } from '../middleware/upload.js';

const router = express.Router();

// Get profile
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    
    // Create default profile if doesn't exist
    if (!profile) {
      profile = new Profile({
        name: 'Your Name',
        email: 'your@email.com'
      });
      await profile.save();
    }

    console.log('📤 Profile returned to frontend:', {
      name: profile.name,
      socialLinks: profile.socialLinks,
      stats: profile.stats
    });

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update profile (admin only)
router.put('/',
  auth,
  upload.any(),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('title').optional().trim(),
    body('bio').optional().trim(),
    body('phone').optional().trim(),
    body('location').optional().trim(),
    body('website').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let profile = await Profile.findOne();
      
      if (!profile) {
        profile = new Profile();
      }

      const {
        name, title, bio, email, phone, location, website,
        mission, values, team, stats, socialLinks, workAvailability, availableTime
      } = req.body;

      // Update basic info
      if (name) profile.name = name;
      if (title) profile.title = title;
      if (bio) profile.bio = bio;
      if (email) profile.email = email;
      if (phone) profile.phone = phone;
      if (location) profile.location = location;
      if (website) profile.website = website;
      if (mission) profile.mission = mission;
      if (workAvailability) profile.workAvailability = workAvailability;
      if (availableTime !== undefined) profile.availableTime = availableTime;

      // Handle avatar file
      const avatarFile = req.files?.find(f => f.fieldname === 'avatar');
      if (avatarFile) {
        const avatarUrl = fileToDataUrl(avatarFile);
        profile.avatar = avatarUrl;
        console.log('✅ Avatar saved:', avatarUrl ? '(base64 in DB)' : 'FAILED');
      }

      // Update social links
      if (socialLinks) {
        profile.socialLinks = {
          ...profile.socialLinks,
          ...socialLinks
        };
      }

      // Update values
      if (values) {
        profile.values = JSON.parse(values);
      }

      // Update team
      if (team) {
        const parsedTeam = JSON.parse(team);
        
        console.log('[Team Update] Files received:', req.files?.map(f => ({ fieldname: f.fieldname, filename: f.filename })));
        console.log('[Team Update] Team members:', parsedTeam.map((m, i) => ({ index: i, name: m.name, hasFile: parsedTeam[i]._fileIndex !== null })));
        
        // Map team avatar files to the correct team members
        for (const [idx, member] of parsedTeam.entries()) {
          const avatarFile = req.files?.find(f => f.fieldname === `teamAvatar_${idx}`);
          console.log(`[Team Update] Member ${idx} (${member.name}): Looking for teamAvatar_${idx}, found: ${avatarFile ? 'YES' : 'NO'}`);
          if (avatarFile) {
            const avatarUrl = fileToDataUrl(avatarFile);
            member.avatar = avatarUrl;
            console.log(`✅ Team member ${idx} avatar saved (base64 in DB)`);
          }
          // Remove the temporary _fileIndex marker
          delete member._fileIndex;
        }
        
        profile.team = parsedTeam;
      }

      // Update stats
      if (stats) {
        profile.stats = {
          ...profile.stats,
          ...JSON.parse(stats)
        };
      }

      await profile.save();

      res.json({
        message: 'Profile updated successfully',
        profile
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
);

export default router;
