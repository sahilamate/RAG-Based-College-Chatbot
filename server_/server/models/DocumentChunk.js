import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'excel'],
    default: 'pdf'
  },
  pageNumber: {
    type: Number,
    required: false,
    default: 1
  },
  sheetName: {
    type: String,
    default: null
  },
  rowNumber: {
    type: Number,
    default: null
  },
  headers: {
    type: [String],
    default: undefined
  },
  structuredData: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined
  },
  keywords: {
    type: [String],
    default: undefined
  },
  academicYear: {
    type: String,
    default: null
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  sectionTitle: {
    type: String,
    default: null
  },
  text: {
    type: String,
    required: true
  },
  characterCount: {
    type: Number,
    default: 0
  },
  tokenCount: {
    type: Number,
    default: 0
  },
  embedding: {
    type: [Number],
    default: undefined
  },
  embeddingModel: {
    type: String,
    default: null
  },
  embeddingDimensions: {
    type: Number,
    default: 0
  },
  embeddingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  embeddingError: {
    type: String,
    default: null
  },
  vectorId: {
    type: String,
    default: null
  },
  vectorDatabase: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index to prevent duplicate chunk indices for a document
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
documentChunkSchema.index({ documentId: 1, pageNumber: 1 });
documentChunkSchema.index({ documentId: 1, embeddingStatus: 1 });
documentChunkSchema.index({ documentId: 1, fileType: 1 });
documentChunkSchema.index({ documentId: 1, sheetName: 1, rowNumber: 1 });

documentChunkSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);
export default DocumentChunk;
