import { retrieveContext } from '../services/ragService.js';

// @desc    Retrieve RAG context for a user question
// @route   POST /api/rag/retrieve
// @access  Private (Student & Admin)
export const retrieveContextHandler = async (req, res, next) => {
  try {
    const { query, minScore, retrievalLimit, department, category, academicYear, documentId } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid question query string'
      });
    }

    const ragResult = await retrieveContext(query, {
      minScore: minScore !== undefined ? parseFloat(minScore) : undefined,
      retrievalLimit: retrievalLimit ? parseInt(retrievalLimit, 10) : undefined,
      department,
      category,
      academicYear,
      documentId
    });

    return res.status(200).json({
      success: true,
      query: ragResult.query,
      hasContext: ragResult.hasContext,
      chunks: ragResult.chunks,
      context: ragResult.context,
      stats: ragResult.stats,
      message: ragResult.message
    });
  } catch (error) {
    if (error.message.includes('exceeds maximum allowed length') || error.message.includes('Invalid query')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
