import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured');
} else {
  console.warn('⚠️ Cloudinary not configured - uploads will use memory storage');
}

// For Vercel/serverless environments, use memory storage
// For local development, use disk storage
const uploadDir = 'uploads';

let storage;
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Use memory storage in production/Vercel (we'll process files to Cloudinary)
  storage = multer.memoryStorage();
  console.log('📍 Using memory storage (production)');
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      reject(new Error('Cloudinary not configured'));
      return;
    }

    const stream = cloudinary.v2.uploader.upload_stream(
      { 
        resource_type: 'auto',
        folder: 'smarthub'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(file.buffer);
  });
};

export default upload;
