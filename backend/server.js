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
  'https://www.smarthubz.vercel.app',
  'https://www.smarthubz.vercel.app/',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function(origin, callback) {
    console.log(`📍 CORS Check - Origin: ${origin || 'no origin'}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    const originNormalized = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (!allowedOrigin) return false;
      const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
      return originNormalized === normalizedAllowed;
    });
    
    if (isAllowed) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.error('❌ CORS blocked for origin:', origin);
      console.error('📋 Allowed origins:', allowedOrigins.filter(o => o));
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files for uploads (only if directory exists)
if (fs.existsSync(path.join(__dirname, 'uploads'))) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Database connection
let mongoDBConnected = false;
let connectionAttempts = 0;
let lastConnectionError = null;

// Enhanced MongoDB connection with better timeout handling and retry
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthub';
console.log('🔄 Attempting to connect to MongoDB...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('📍 MongoDB Atlas URI provided:', mongoURI.includes('mongodb+srv://') ? 'yes' : 'no');

// Parse and log connection string details
if (mongoURI.includes('mongodb+srv://')) {
  try {
    const urlObj = new URL(mongoURI);
    console.log('📍 MongoDB Host:', urlObj.hostname);
    console.log('📍 Database:', urlObj.pathname.replace('/', '') || 'admin');
    console.log('📍 Username:', urlObj.username);
  } catch (e) {
    console.error('📍 Failed to parse MongoDB URI:', e.message);
  }
}

const connectToMongoDB = async () => {
  connectionAttempts++;
  console.log(`\n📍 Connection attempt ${connectionAttempts}...`);
  
  // Create a promise that rejects after timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Connection timeout after 35 seconds'));
    }, 35000);
  });

  try {
    const connectionPromise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 35000,
      socketTimeoutMS: 65000,
      connectTimeoutMS: 35000,
      maxPoolSize: 3,
      minPoolSize: 0,
      maxIdleTimeMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      authSource: 'admin',
      compressors: 'snappy,zlib'
    });

    // Race between connection and timeout
    await Promise.race([connectionPromise, timeoutPromise]);
    
    mongoDBConnected = true;
    lastConnectionError = null;
    console.log('✅ MongoDB connected successfully on attempt', connectionAttempts);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    console.log('   Port:', mongoose.connection.port);
    return true;
  } catch (err) {
    mongoDBConnected = false;
    lastConnectionError = err.message;
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Error code:', err.code || 'N/A');
    console.error('   Error type:', err.name);
    console.error('   Stack:', err.stack?.split('\n').slice(0, 3).join('\n') || 'N/A');
    
    // Retry connection after delay on Vercel
    if (process.env.NODE_ENV === 'production' && connectionAttempts < 5) {
      const delayMs = Math.pow(2, connectionAttempts) * 2000; // Exponential: 4s, 8s, 16s, 32s, 64s
      console.log(`⏱️ Retrying in ${delayMs}ms (attempt ${connectionAttempts + 1}/5)...`);
      setTimeout(connectToMongoDB, delayMs);
    } else if (process.env.NODE_ENV !== 'production') {
      console.error('Development mode - exiting due to connection failure');
      process.exit(1);
    }
    
    return false;
  }
};

// Start initial connection attempt (non-blocking)
console.log('Starting MongoDB connection in background...\n');
connectToMongoDB();

// Monitor MongoDB connection state
mongoose.connection.on('connecting', () => {
  console.log('🔄 MongoDB is connecting...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error event:', err.message);
  mongoDBConnected = false;
});

mongoose.connection.on('disconnected', () => {
  mongoDBConnected = false;
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  mongoDBConnected = true;
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('reconnected', () => {
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
app.use('/api/', async (req, res, next) => {
  // Allow these endpoints even during cold start/connection issues
  const allowedWithoutDB = [
    '/health',
    '/diagnose',
    '/auth/setup',      // Allow setup to run and wait for DB if needed
    '/auth/login',      // Allow login attempts - DB will either connect or fail
    '/auth/register',   // Allow register attempts
    '/auth/verify',     // Allow verification
    '/auth'             // Allow all /api/auth/* routes
  ];
  
  // Check if the current path (without /api prefix) matches an allowed path
  const pathWithoutApi = req.path; // req.path is everything after /api/
  const isAllowed = allowedWithoutDB.some(allowedPath => {
    return pathWithoutApi === allowedPath || pathWithoutApi.startsWith(allowedPath + '/') || pathWithoutApi.startsWith(allowedPath);
  });
  
  if (isAllowed) {
    return next();
  }
  
  // For other routes, wait for MongoDB to connect (up to 10 seconds)
  if (mongoose.connection.readyState !== 1) {
    console.log(`⏳ Waiting for MongoDB to connect for ${req.method} /api${req.path}...`);
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts && mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    if (mongoose.connection.readyState !== 1) {
      console.warn(`❌ MongoDB still not connected after ${maxAttempts} seconds for ${req.method} /api${req.path}`);
      return res.status(503).json({ 
        message: 'Database connection not available',
        error: 'MongoDB is not connected. Please check your connection string.'
      });
    }
    
    console.log(`✅ MongoDB connected! Proceeding with ${req.method} /api${req.path}`);
  }
  
  next();
});

// Routes
console.log('🔧 Mounting routes...');
console.log('📊 Route objects:', {
  authRoutes: typeof authRoutes,
  projectRoutes: typeof projectRoutes,
  profileRoutes: typeof profileRoutes,
  serviceRoutes: typeof serviceRoutes,
  contactRoutes: typeof contactRoutes
});

app.use('/api/auth', authRoutes);
console.log('✓ /api/auth mounted');
app.use('/api/projects', projectRoutes);
console.log('✓ /api/projects mounted');
app.use('/api/profile', profileRoutes);
console.log('✓ /api/profile mounted');
app.use('/api/services', serviceRoutes);
console.log('✓ /api/services mounted');
app.use('/api/contact', contactRoutes);
console.log('✓ /api/contact mounted');

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartHub Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/diagnose',
      '/api/profile',
      '/api/projects',
      '/api/services',
      '/api/contact',
      '/api/auth'
    ],
    note: 'All API endpoints must be accessed with /api/ prefix'
  });
});

// Catch requests to /profile, /services, /projects, etc. without /api prefix and redirect
app.get('/:path', (req, res) => {
  const path = req.params.path;
  const allowedPaths = ['profile', 'projects', 'services', 'contact', 'auth', 'health', 'diagnose'];
  
  if (allowedPaths.includes(path)) {
    console.warn(`⚠️ Redirecting ${req.method} /${path} to /api/${path}`);
    res.status(301).json({
      message: 'Use /api prefix for API endpoints',
      redirect: `/api/${path}`,
      correctUrl: `https://${req.get('host')}/api/${path}`
    });
  } else {
    res.status(404).json({ message: 'Route not found' });
  }
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

// Diagnostic endpoint for troubleshooting
app.get('/api/diagnose', (req, res) => {
  const dbConnectionState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const mongoUriSet = !!process.env.MONGODB_URI;
  const mongoUriLength = process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0;
  const mongoUriHasPassword = process.env.MONGODB_URI ? process.env.MONGODB_URI.includes(':') : false;
  const mongoUriMasked = process.env.MONGODB_URI ? 
    process.env.MONGODB_URI.replace(/:[^@]+@/, ':****@') : 'NOT SET';

  res.json({
    status: 'Diagnostic Report',
    timestamp: new Date().toISOString(),
    connectionAttempts: connectionAttempts,
    lastConnectionError: lastConnectionError,
    server: {
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      mongooseVersion: mongoose.version,
      uptime: process.uptime()
    },
    database: {
      connectionState: dbStates[dbConnectionState],
      stateCode: dbConnectionState,
      connected: dbConnectionState === 1,
      host: mongoose.connection.host || 'unknown',
      port: mongoose.connection.port || 'unknown',
      database: mongoose.connection.name || 'unknown',
      mongoUriConfigured: mongoUriSet,
      mongoUriLength: mongoUriLength,
      mongoUriHasPassword: mongoUriHasPassword,
      mongoUriMasked: mongoUriMasked,
      mongoUriProvider: mongoUriSet && mongoUriLength > 0 ? (
        process.env.MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local/Other'
      ) : 'not configured'
    },
    configuration: {
      FRONTEND_URL: process.env.FRONTEND_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV || 'development',
      MONGODB_URI_SET: mongoUriSet ? 'yes ✓' : 'NO ✗ - THIS IS THE PROBLEM',
      JWT_SECRET_SET: !!process.env.JWT_SECRET ? 'yes ✓' : 'no ✗',
      GMAIL_USER_SET: !!process.env.GMAIL_USER ? 'yes ✓' : 'no ✗'
    },
    troubleshooting: {
      message: !mongoUriSet ? '🔴 CRITICAL: MONGODB_URI environment variable not set on Vercel!' : (
        dbConnectionState === 1 ? '🟢 MongoDB is connected successfully!' : (
          connectionAttempts > 0 ? `🟡 MongoDB connection attempted ${connectionAttempts} time(s) but failed. Check your connection string.` : '🔴 No connection attempts made yet'
        )
      ),
      nextSteps: !mongoUriSet ? [
        '1. ✗ MONGODB_URI is NOT set on Vercel - SET IT NOW',
        '2. Go to Vercel Dashboard → smarthubzbackend → Settings → Environment Variables',
        '3. Add: MONGODB_URI = mongodb+srv://smarthub-admin:NDpHX8RyRDwEw2pi@smarthubz.j6wwkxo.mongodb.net/?appName=SmartHubz',
        '4. Click Redeploy'
      ] : (
        dbConnectionState !== 1 ? [
          '1. ✓ MONGODB_URI is set',
          '2. ✗ Connection failed - likely causes:',
          '   a. Wrong password for smarthub-admin user',
          '   b. IP whitelist doesn\'t include Vercel IPs (set to 0.0.0.0/0)',
          '   c. Database name in URI is incorrect',
          '   d. Special characters in password not URL encoded'
        ] : [
          '✓ Everything looks good!'
        ]
      )
    }
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'SmartHub Backend API',
    status: 'running',
    endpoints: [
      '/api/health',
      '/api/diagnose',
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
  console.warn(`⚠️ 404 - ${req.method} ${req.path} - no route matched`);
  res.status(404).json({ message: 'Route not found' });
});

// Export app for Vercel serverless and other uses
export default app;
