import mongoose from 'mongoose';
import Project from './models/Project.js';
import dotenv from 'dotenv';

dotenv.config();

const createSampleProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthub');
    console.log('Connected to MongoDB\n');

    // Sample projects using ACTUAL existing upload files
    const sampleProjects = [
      {
        id: 'ecommerce-platform',
        title: 'E-Commerce Platform',
        desc: 'A full-stack e-commerce solution with payment integration',
        fullDescription: 'A comprehensive e-commerce platform built with React and Node.js, featuring product catalog, shopping cart, payment processing, and admin dashboard.',
        challenge: 'Building a scalable platform that can handle high traffic and secure payment transactions',
        solution: 'Implemented microservices architecture with Redis caching and Stripe payment integration',
        image: '/uploads/images-1765107615417-552630496.png',
        images: [
          '/uploads/images-1765107615417-552630496.png',
          '/uploads/images-1765107615582-233085919.png'
        ],
        tags: ['Web Development', 'React', 'Node.js', 'MongoDB'],
        tools: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        client: 'TechCorp Inc.',
        year: 2024,
        link: '#',
        status: 'published'
      },
      {
        id: 'mobile-app-design',
        title: 'Mobile App Design',
        desc: 'Beautiful UI/UX design for a fitness tracking mobile application',
        fullDescription: 'Comprehensive mobile app design with intuitive user interface for fitness tracking, including workout logs, progress analytics, and social features.',
        challenge: 'Creating an intuitive interface for complex fitness tracking features',
        solution: 'Conducted user research and iterative design sprints to create user-friendly interface',
        image: '/uploads/images-1765107615681-679662359.png',
        images: [
          '/uploads/images-1765107615681-679662359.png',
          '/uploads/images-1765107615727-245550353.png'
        ],
        tags: ['UI/UX Design', 'Mobile App', 'Branding'],
        tools: ['Figma', 'Adobe XD', 'Prototyping'],
        client: 'FitLife Corp',
        year: 2024,
        link: '#',
        status: 'published'
      },
      {
        id: 'brand-identity',
        title: 'Brand Identity Package',
        desc: 'Complete branding package including logo, color palette, and brand guidelines',
        fullDescription: 'Full brand identity redesign featuring modern logo, comprehensive color palette, typography guidelines, and complete brand asset library.',
        challenge: 'Creating a unique identity that stands out in a competitive market',
        solution: 'Developed distinctive visual language combining modern trends with timeless design principles',
        image: '/uploads/images-1765107696491-881000572.png',
        images: [
          '/uploads/images-1765107696491-881000572.png',
          '/uploads/images-1765107615727-245550353.png'
        ],
        tags: ['Branding', 'Design', 'Graphics'],
        tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma'],
        client: 'StartupXYZ',
        year: 2024,
        link: '#',
        status: 'published'
      }
    ];

    // Delete sample projects if they exist
    await Project.deleteMany({ id: { $in: ['ecommerce-platform', 'mobile-app-design', 'brand-identity'] } });

    // Insert new projects
    const created = await Project.insertMany(sampleProjects);
    console.log(`✅ Created ${created.length} sample projects with EXISTING images:\n`);
    
    created.forEach((project, idx) => {
      console.log(`${idx + 1}. ${project.title}`);
      console.log(`   Image: ${project.images[0]}`);
    });

    // Show all projects
    const all = await Project.find();
    console.log(`\n📊 Total projects in database: ${all.length}`);
    all.forEach(p => {
      console.log(`  - ${p.title} (${p.images.length} images)`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createSampleProjects();
