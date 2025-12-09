import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      default: 'Full Stack Developer & Designer',
      trim: true
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    avatar: {
      type: String,
      default: '/images/default-avatar.jpg'
    },
    coverImage: {
      type: String,
      default: '/images/bg1.jpg'
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' }
    },
    mission: {
      type: String,
      default: 'I\'m passionate about building creative solutions for real-world problems.',
      trim: true
    },
    values: [{
      title: String,
      description: String
    }],
    team: [{
      name: String,
      role: String,
      avatar: String,
      bio: String
    }],
    stats: {
      projectsCompleted: { type: Number, default: 0 },
      yearsExperience: { type: Number, default: 0 },
      clientsSatisfied: { type: Number, default: 0 }
    },
    workAvailability: {
      type: String,
      enum: ['Available', 'Not Available', 'On Leave', 'Limited Time'],
      default: 'Available'
    },
    availableTime: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
