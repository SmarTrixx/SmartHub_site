import mongoose from 'mongoose';
import Project from './models/Project.js';
import dotenv from 'dotenv';

dotenv.config();

const checkProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthub');
    console.log('Connected to MongoDB\n');

    const projects = await Project.find().limit(5);
    console.log(`Found ${projects.length} projects:\n`);
    
    projects.forEach((project, idx) => {
      console.log(`${idx + 1}. ${project.title}`);
      console.log(`   ID: ${project._id}`);
      console.log(`   Image: ${project.image}`);
      console.log(`   Images Array:`, project.images);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

checkProjects();
