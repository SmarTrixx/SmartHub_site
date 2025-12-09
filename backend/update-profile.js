import mongoose from 'mongoose';
import Profile from './models/Profile.js';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthub');
    
    // Update the profile with social links
    const updated = await Profile.findOneAndUpdate(
      {},
      {
        socialLinks: {
          email: "yuzuphbahbahtundey007@gmail.com",
          twitter: "https://twitter.com/smarthub",
          github: "https://github.com/SmarTrixx",
          linkedin: "https://www.linkedin.com/in/tunde-yusuf-40408a194",
          instagram: "https://instagram.com/smarthub",
          facebook: "https://facebook.com/smarthub"
        }
      },
      { new: true }
    );
    
    console.log("✅ Profile updated with social links:");
    console.log(JSON.stringify(updated.socialLinks, null, 2));
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
