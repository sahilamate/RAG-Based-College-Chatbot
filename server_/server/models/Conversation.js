import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
