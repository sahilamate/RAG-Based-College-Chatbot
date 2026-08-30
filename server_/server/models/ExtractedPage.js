import mongoose from 'mongoose';

const extractedPageSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  characterCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index to prevent duplicate page numbers for a document
extractedPageSchema.index({ documentId: 1, pageNumber: 1 }, { unique: true });

extractedPageSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const ExtractedPage = mongoose.model('ExtractedPage', extractedPageSchema);
export default ExtractedPage;
