import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    documentId: String,
    documentTitle: String,
    fileName: String,
    pageNumber: Number,
    chunkIndex: Number,
    relevanceScore: Number,
    snippet: String
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    sources: {
      type: [sourceSchema],
      default: []
    },
    hasContext: {
      type: Boolean,
      default: true
    },
    feedback: {
      type: String,
      enum: ['positive', 'negative', null],
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

messageSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
