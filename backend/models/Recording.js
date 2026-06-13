const mongoose = require('mongoose');

const CATEGORIES = ['General', 'Follow-up', 'Initial Consultation', 'Therapy', 'Legal', 'Medical', 'Other'];

const recordingSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [150, 'Client name cannot exceed 150 characters'],
    },
    title: {
      type: String,
      required: [true, 'Consultation title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    consultationDate: {
      type: Date,
      required: [true, 'Consultation date is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Invalid category',
      },
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

recordingSchema.index({ clientName: 'text', title: 'text' });
recordingSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Recording', recordingSchema);
module.exports.CATEGORIES = CATEGORIES;
