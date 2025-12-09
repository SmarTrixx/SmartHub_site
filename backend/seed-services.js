import mongoose from 'mongoose';
import Service from './models/Service.js';
import dotenv from 'dotenv';

dotenv.config();

const seedServices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthub');
    console.log('Connected to MongoDB');

    // Default services from Home.jsx
    const defaultServices = [
      {
        id: 'software-development',
        title: 'Software Development',
        description: 'Custom web apps, landing pages, dashboards, and solutions tailored to your needs.',
        icon: '💻',
        features: [
          'Web Applications',
          'Mobile Apps',
          'Landing Pages',
          'Dashboards',
          'Custom Solutions'
        ],
        price: 'Contact for pricing',
        status: 'active',
        order: 1
      },
      {
        id: 'graphics-branding',
        title: 'Graphics & Branding',
        description: 'Logos, flyers, mockups, and full brand kits that speak volumes.',
        icon: '🎨',
        features: [
          'Logo Design',
          'Brand Identity',
          'Flyers & Brochures',
          'Mockups',
          'Brand Kits'
        ],
        price: 'Contact for pricing',
        status: 'active',
        order: 2
      },
      {
        id: 'tech-support-automation',
        title: 'Tech Support & Automation',
        description: 'Simplify your workflow with automation tools and smart integrations.',
        icon: '📱',
        features: [
          'Automation Tools',
          'Smart Integrations',
          'Workflow Optimization',
          'Technical Support',
          'System Maintenance'
        ],
        price: 'Contact for pricing',
        status: 'active',
        order: 3
      }
    ];

    // Check if services already exist
    const existingCount = await Service.countDocuments();
    
    if (existingCount === 0) {
      // Insert services
      await Service.insertMany(defaultServices);
      console.log('✅ Successfully seeded 3 default services to database');
      console.log('Services added:');
      defaultServices.forEach(service => {
        console.log(`  - ${service.title} (${service.icon})`);
      });
    } else {
      console.log(`⚠️  Database already contains ${existingCount} services. Skipping seed.`);
      console.log('To reseed, clear the services collection first.');
    }

    // Show all services in database
    const allServices = await Service.find({});
    console.log('\n📋 Current services in database:');
    allServices.forEach(service => {
      console.log(`  - ${service.title} (${service.icon}) - ${service.status}`);
    });

  } catch (error) {
    console.error('❌ Error seeding services:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedServices();
