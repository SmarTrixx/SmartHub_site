import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
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
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true
    },
    icon: {
      type: String,
      default: 'FiCode'
    },
    features: [{
      type: String,
      trim: true
    }],
    price: {
      type: String,
      default: 'Contact for pricing'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
