import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { answerQuestion } from '../services/chatService.js';

// @desc    Send question & receive Grounded RAG + LLM response
// @route   POST /api/chat
// @access  Private (Student & Admin)
export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId, department, category, academicYear } = req.body;
    const userId = req.user._id;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    const trimmed = message.trim();
    const maxLength = parseInt(process.env.MAX_QUERY_LENGTH, 10) || 1000;

    if (trimmed.length > maxLength) {
      return res.status(400).json({
        success: false,
        message: `Message text exceeds maximum allowed length of ${maxLength} characters`
      });
    }

    const chatResult = await answerQuestion(trimmed, userId, conversationId, {
      department,
      category,
      academicYear
    });

    return res.status(200).json({
      success: true,
      answer: chatResult.answer,
      hasContext: chatResult.hasContext,
      sources: chatResult.sources,
      conversationId: chatResult.conversationId,
      messageId: chatResult.messageId
    });
  } catch (error) {
    next(error);
  }
};

// Alias for askQuestion
export const askQuestion = sendMessage;

// @desc    Get authenticated user's conversation history
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 });

    const formatted = await Promise.all(
      conversations.map(async (c) => {
        const messagesCount = await Message.countDocuments({ conversationId: c._id });
        const firstUserMsg = await Message.findOne({ conversationId: c._id, role: 'user' })
          .sort({ createdAt: 1 })
          .select('content');

        const snippetText = firstUserMsg ? firstUserMsg.content : c.title;

        return {
          id: c._id,
          title: c.title,
          snippet: snippetText,
          messagesCount,
          messages: firstUserMsg
            ? [{ role: 'user', sender: 'user', content: firstUserMsg.content, text: firstUserMsg.content }]
            : [],
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        };
      })
    );

    return res.status(200).json({
      success: true,
      conversations: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation details and messages list
// @route   GET /api/chat/:conversationId
// @access  Private
export const getConversationDetails = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Verify ownership
    if (conversation.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot access another user conversation'
      });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    const formattedMessages = messages.map((m) => ({
      id: m._id,
      role: m.role,
      content: m.content,
      sources: m.sources,
      hasContext: m.hasContext !== false,
      feedback: m.feedback,
      createdAt: m.createdAt
    }));

    return res.status(200).json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: formattedMessages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete conversation and messages
// @route   DELETE /api/chat/:conversationId
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete another user conversation'
      });
    }

    await Message.deleteMany({ conversationId });
    await conversation.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit message feedback (positive/negative)
// @route   POST /api/chat/:conversationId/feedback
// @access  Private
export const submitFeedback = async (req, res, next) => {
  try {
    const { messageId, feedback } = req.body;

    if (!['positive', 'negative', null].includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: 'Feedback must be "positive", "negative", or null'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.feedback = feedback;
    await message.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback saved successfully',
      feedback: message.feedback
    });
  } catch (error) {
    next(error);
  }
};
