import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },
    fileName: {
      type: String,
      required: [true, 'Stored file name is required'],
      trim: true
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    filePath: {
      type: String,
      required: [true, 'File path is required']
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required']
    },
    department: {
      type: String,
      trim: true,
      default: 'All Departments'
    },
    category: {
      type: String,
      enum: [
        'Admissions',
        'Academics',
        'Fees',
        'Exams',
        'Hostel',
        'Library',
        'Scholarships',
        'Placements',
        'Policies',
        'Events',
        'Other'
      ],
      default: 'Other'
    },
    academicYear: {
      type: String,
      trim: true,
      default: '2026'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileType: {
      type: String,
      enum: ['pdf', 'excel'],
      default: 'pdf'
    },
    sheetsCount: {
      type: Number,
      default: 0
    },
    rowsCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['uploaded', 'extracting', 'extracted', 'chunking', 'chunked', 'embedding', 'ready', 'processed', 'failed'],
      default: 'uploaded'
    },
    pages: {
      type: Number,
      default: 0
    },
    chunks: {
      type: Number,
      default: 0
    },
    processingError: {
      type: String,
      default: null
    },
    embeddingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    embeddedChunks: {
      type: Number,
      default: 0
    },
    embeddingModel: {
      type: String,
      default: null
    },
    embeddingError: {
      type: String,
      default: null
    },
    vectorStatus: {
      type: String,
      enum: ['not_ready', 'ready', 'failed'],
      default: 'not_ready'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
documentSchema.index({ title: 'text', originalFileName: 'text', description: 'text' });
documentSchema.index({ department: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ academicYear: 1 });
documentSchema.index({ embeddingStatus: 1 });
documentSchema.index({ vectorStatus: 1 });

documentSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
