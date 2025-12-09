import multer from 'multer';
import path from 'path';
import fs from 'fs';

// For Vercel/serverless environments, use memory storage
// For local development, use disk storage
const uploadDir = 'uploads';

let storage;
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Use memory storage in production/Vercel (serverless has read-only filesystem)
  storage = multer.memoryStorage();
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export default upload;
