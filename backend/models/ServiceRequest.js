import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      enum: ['Graphics Design', 'Software Development', 'Tech Support', 'Branding & Identity', 'Automation'],
      required: true
    },
    clientName: {
      type: String,
      required: true,
      trim: true
    },
    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    clientPhone: {
      type: String,
      default: '',
      trim: true
    },
    projectDetails: {
      type: String,
      required: true
    },
    additionalData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    attachments: [{
      fieldname: String,
      originalName: String,
      mimetype: String,
      size: Number,
      dataUrl: String // Base64 encoded file data
    }],
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'in-progress', 'completed', 'rejected'],
      default: 'pending'
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now
    },
    termsAccepted: {
      type: Boolean,
      required: true
    },
    ipAddress: String,
    userAgent: String,
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('ServiceRequest', serviceRequestSchema);
