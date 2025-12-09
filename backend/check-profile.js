import mongoose from 'mongoose';
import Profile from './models/Profile.js';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthub');
    const profile = await Profile.findOne();
    
    if (!profile) {
      console.log("No profile found in database");
    } else {
      console.log("Profile found:");
      console.log(JSON.stringify({
        name: profile.name,
        email: profile.email,
        socialLinks: profile.socialLinks,
        workAvailability: profile.workAvailability,
        availableTime: profile.availableTime,
        team: profile.team
      }, null, 2));
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
