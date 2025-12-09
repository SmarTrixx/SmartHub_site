import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    desc: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    fullDescription: {
      type: String,
      required: true,
      trim: true
    },
    challenge: {
      type: String,
      required: true,
      trim: true
    },
    solution: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Featured image is required']
    },
    images: [{
      type: String,
      required: true
    }],
    tags: [{
      type: String,
      required: true,
      trim: true
    }],
    tools: [{
      type: String,
      trim: true
    }],
    client: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear()
    },
    link: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    viewCount: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
projectSchema.index({ tags: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ featured: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
