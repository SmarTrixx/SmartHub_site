import multer from 'multer';
import path from 'path';
import fs from 'fs';

// For Vercel/serverless environments, use memory storage
// For local development, use disk storage
const uploadDir = 'uploads';

let storage;
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Use memory storage in production/Vercel (we'll convert to base64 and store in DB)
  storage = multer.memoryStorage();
  console.log('📍 Using memory storage (production) - will store as base64');
} else {
  // Use disk storage in development
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    console.log('📍 Using disk storage (development)');
  } catch (err) {
    console.warn('Warning: Could not create uploads directory, using memory storage:', err);
    storage = multer.memoryStorage();
  }
}

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for individual files
    fieldSize: 50 * 1024 * 1024, // 50MB limit for form fields (to handle large team data with base64 avatars)
    fieldNameSize: 100
  }
});

// Helper function to convert file to base64 data URL
export const fileToDataUrl = (file) => {
  if (!file) return null;
  
  // If it has a buffer (from memory storage), convert to base64
  if (file.buffer) {
    const base64 = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64}`;
  }
  
  // If it has a filename (from disk storage), return uploads path
  if (file.filename) {
    return `/uploads/${file.filename}`;
  }
  
  return null;
};

export default upload;
