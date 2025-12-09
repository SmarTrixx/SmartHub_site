import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://smarthubz.vercel.app',
  'https://smarthubz.vercel.app/',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || origin === allowedOrigin.replace(/\/$/, '');
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files for uploads (only if directory exists)
if (fs.existsSync(path.join(__dirname, 'uploads'))) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Database connection
let mongoDBConnected = false;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthub', {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
})
  .then(() => {
    mongoDBConnected = true;
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    mongoDBConnected = false;
    console.error('❌ MongoDB connection error:', err.message);
    // Don't exit on Vercel - just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Monitor MongoDB connection state
mongoose.connection.on('disconnected', () => {
  mongoDBConnected = false;
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  mongoDBConnected = true;
  console.log('✅ MongoDB reconnected');
});

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import profileRoutes from './routes/profile.js';
import serviceRoutes from './routes/services.js';
import contactRoutes from './routes/contact.js';

// Middleware to check MongoDB connection for API routes
app.use('/api/', (req, res, next) => {
  // Allow health check even without DB
  if (req.path === '/health') {
    return next();
  }
  
  // For other routes, check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    console.warn(`⚠️ Attempted ${req.method} ${req.path} but MongoDB not connected. State: ${mongoose.connection.readyState}`);
    return res.status(503).json({ 
      message: 'Database connection not available',
      error: 'MongoDB is not connected. Please check your connection string.'
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartHub Backend API',
    status: 'running',
    endpoints: [
      '/api/health',
      '/api/profile',
      '/api/projects',
      '/api/services',
      '/api/contact',
      '/api/auth'
    ]
  });
});

// Health check endpoint with database status
app.get('/api/health', (req, res) => {
  const dbConnectionState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(dbConnectionState === 1 ? 200 : 503).json({
    status: 'API is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnectionState === 1,
      state: dbStates[dbConnectionState],
      stateCode: dbConnectionState
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'SmartHub Backend API',
    status: 'running',
    endpoints: [
      '/api/health',
      '/api/profile',
      '/api/projects',
      '/api/services',
      '/api/contact',
      '/api/auth'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export app for Vercel serverless and other uses
export default app;
