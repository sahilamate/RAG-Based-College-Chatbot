import User from '../models/User.js';
import Document from '../models/Document.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Get aggregated Admin Dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalDocuments = await Document.countDocuments();
    const uploadedDocuments = await Document.countDocuments({ status: 'uploaded' });
    const processedDocuments = await Document.countDocuments({ status: 'processed' });
    const processingDocuments = await Document.countDocuments({ status: 'processing' });
    const failedDocuments = await Document.countDocuments({ status: 'failed' });
    const totalConversations = await Conversation.countDocuments();
    const totalQuestions = await Message.countDocuments({ role: 'user' });

    // Aggregate total chunk count across documents
    const chunkAggregate = await Document.aggregate([
      { $group: { _id: null, totalChunks: { $sum: '$chunks' } } }
    ]);

    const totalChunks = chunkAggregate[0]?.totalChunks || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDocuments,
        uploadedDocuments,
        processedDocuments,
        processingDocuments,
        failedDocuments,
        totalConversations,
        totalQuestions,
        totalChunks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Analytics aggregation data
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalyticsData = async (req, res, next) => {
  try {
    const positiveCount = await Message.countDocuments({ feedback: 'positive' });
    const negativeCount = await Message.countDocuments({ feedback: 'negative' });

    const totalFeedback = positiveCount + negativeCount;
    const helpfulPercentage = totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 100;

    const categoryStats = await Document.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalChunks: { $sum: '$chunks' } } },
      { $sort: { count: -1 } }
    ]);

    const departmentStats = await Document.aggregate([
      { $group: { _id: '$department', totalDocs: { $sum: 1 }, totalChunks: { $sum: '$chunks' } } }
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        feedback: {
          positive: positiveCount,
          negative: negativeCount,
          helpfulPercentage: `${helpfulPercentage}%`
        },
        categories: categoryStats,
        departments: departmentStats
      }
    });
  } catch (error) {
    next(error);
  }
};
