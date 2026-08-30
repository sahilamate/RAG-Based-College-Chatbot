import { generateEmbeddings, getEmbeddingConfig } from '../services/embeddingService.js';
import { searchSimilarChunks, getVectorSearchConfig } from '../services/vectorSearchService.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';

// @desc    Test Semantic Vector Search with Text Query (Admin Test Suite)
// @route   POST /api/vector-search/test-query
// @access  Private/Admin
export const testQuerySearch = async (req, res, next) => {
  try {
    const { query, limit, minScore, department, category, academicYear, documentId } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid query text for vector search'
      });
    }

    const trimmedQuery = query.trim();

    // 1. Generate query embedding using the SAME model as document chunks
    const embeddingResult = await generateEmbeddings([trimmedQuery]);
    if (!embeddingResult.vectors || embeddingResult.vectors.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate vector embedding for query'
      });
    }

    const queryEmbedding = embeddingResult.vectors[0];

    // 2. Perform Vector Search
    const results = await searchSimilarChunks(queryEmbedding, {
      limit: parseInt(limit, 10) || 5,
      minScore: minScore !== undefined ? parseFloat(minScore) : undefined,
      department,
      category,
      academicYear,
      documentId
    });

    return res.status(200).json({
      success: true,
      query: trimmedQuery,
      model: embeddingResult.modelName,
      dimensions: embeddingResult.dimensions,
      resultsCount: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test Vector Search with pre-generated raw vector array
// @route   POST /api/vector-search/test
// @access  Private/Admin
export const testRawVector = async (req, res, next) => {
  try {
    const { queryEmbedding, limit, minScore } = req.body;

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a non-empty queryEmbedding array of numbers'
      });
    }

    const results = await searchSimilarChunks(queryEmbedding, {
      limit: parseInt(limit, 10) || 5,
      minScore: minScore !== undefined ? parseFloat(minScore) : undefined
    });

    return res.status(200).json({
      success: true,
      resultsCount: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Vector Search System Health & Readiness Status
// @route   GET /api/vector-search/health
// @access  Private/Admin
export const getVectorSearchHealth = async (req, res, next) => {
  try {
    const searchConfig = getVectorSearchConfig();
    const embedConfig = getEmbeddingConfig();

    const totalDocuments = await Document.countDocuments();
    const readyDocuments = await Document.countDocuments({ embeddingStatus: 'completed' });
    const totalEmbeddedChunks = await DocumentChunk.countDocuments({ embeddingStatus: 'completed' });

    return res.status(200).json({
      success: true,
      vectorSearch: {
        configured: true,
        indexName: searchConfig.indexName,
        provider: embedConfig.provider,
        model: embedConfig.model,
        numCandidates: searchConfig.numCandidates,
        defaultLimit: searchConfig.limit,
        minScoreThreshold: searchConfig.minScore,
        totalDocuments,
        readyDocuments,
        totalEmbeddedChunks
      }
    });
  } catch (error) {
    next(error);
  }
};
