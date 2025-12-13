import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('URI provided:', !!mongoURI);
console.log('URI type:', mongoURI?.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');

if (!mongoURI) {
  console.error('ERROR: MONGODB_URI not set!');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Connection failed:');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
  });
