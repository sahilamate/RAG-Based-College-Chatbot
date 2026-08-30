import DocumentChunk from '../models/DocumentChunk.js';
import Document from '../models/Document.js';

/**
 * Get Vector Search Configuration from Environment
 */
export const getVectorSearchConfig = () => {
  return {
    indexName: process.env.VECTOR_INDEX_NAME || 'collegeai_vector_index',
    numCandidates: parseInt(process.env.VECTOR_SEARCH_NUM_CANDIDATES, 10) || 100,
    limit: parseInt(process.env.VECTOR_SEARCH_LIMIT, 10) || 5,
    minScore: parseFloat(process.env.VECTOR_SEARCH_MIN_SCORE) || 0.30
  };
};

/**
 * Compute Cosine Similarity between two numerical vectors in JS (Fallback engine)
 */
const computeCosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return parseFloat(similarity.toFixed(4));
};

/**
 * Search top-K semantically similar DocumentChunks for a query vector.
 * Supports MongoDB Atlas $vectorSearch with an exact Cosine Similarity fallback for local DBs.
 * 
 * @param {Array<number>} queryEmbedding - Numerical vector for query
 * @param {Object} [options] - Search overrides { query, limit, numCandidates, minScore, department, category, academicYear, documentId }
 * @returns {Promise<Array<Object>>}
 */
export const searchSimilarChunks = async (queryEmbedding, options = {}) => {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error('Invalid query embedding: Must be a non-empty array of numbers');
  }

  const config = getVectorSearchConfig();
  const limit = options.limit || config.limit;
  const numCandidates = options.numCandidates || config.numCandidates;
  const minScore = options.minScore !== undefined ? options.minScore : config.minScore;

  console.log(`\n[VECTOR SEARCH]`);
  if (options.query) {
    console.log(`[VECTOR SEARCH] Query: "${options.query}"`);
  }
  console.log(`[VECTOR SEARCH] Query embedding dimensions: ${queryEmbedding.length}`);
  console.log(`[VECTOR SEARCH] Index: ${config.indexName}`);
  console.log(`[VECTOR SEARCH] Min score threshold: ${minScore}`);

  let results = [];

  try {
    // 1. Primary Attempt: MongoDB Atlas $vectorSearch Aggregation
    const atlasPipeline = [
      {
        $vectorSearch: {
          index: config.indexName,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: numCandidates,
          limit: limit * 2,
          filter: { embeddingStatus: 'completed' }
        }
      },
      {
        $project: {
          _id: 1,
          documentId: 1,
          pageNumber: 1,
          chunkIndex: 1,
          text: 1,
          embeddingModel: 1,
          embeddingDimensions: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    if (options.documentId) {
      atlasPipeline[0].$vectorSearch.filter.documentId = options.documentId;
    }

    results = await DocumentChunk.aggregate(atlasPipeline);
  } catch (err) {
    console.log(`[VECTOR SEARCH] Atlas $vectorSearch not active (${err.message}). Using local Cosine Similarity engine.`);
    
    // 2. Fallback Engine: Exact In-Memory Cosine Similarity
    const matchQuery = { embeddingStatus: 'completed', embedding: { $exists: true, $ne: null } };
    if (options.documentId) matchQuery.documentId = options.documentId;

    const completedChunks = await DocumentChunk.find(matchQuery).select('_id documentId pageNumber sheetName chunkIndex text embedding').lean();

    const scoredChunks = completedChunks.map((chunk) => {
      const score = computeCosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        _id: chunk._id,
        documentId: chunk.documentId,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        embeddingModel: chunk.embeddingModel,
        embeddingDimensions: chunk.embeddingDimensions,
        score
      };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    results = scoredChunks.slice(0, limit * 2);
  }

  console.log(`[VECTOR SEARCH] Number of candidates: ${results.length}`);

  if (results.length === 0) {
    console.log(`[VECTOR SEARCH] Number of results: 0`);
    console.log(`[VECTOR SEARCH] Search completed`);
    return [];
  }

  // 3. Populate Document Metadata (title, department, category, academicYear)
  const documentIds = [...new Set(results.map((r) => r.documentId.toString()))];
  const documentsList = await Document.find({ _id: { $in: documentIds } }).select(
    'title originalFileName department category academicYear'
  );

  const docMap = {};
  documentsList.forEach((d) => {
    docMap[d._id.toString()] = d;
  });

  const enrichedResults = results
    .map((r) => {
      const doc = docMap[r.documentId.toString()];
      return {
        id: r._id,
        documentId: r.documentId,
        documentTitle: doc ? doc.title : 'College Document',
        originalFileName: doc ? doc.originalFileName : 'document.pdf',
        department: doc ? doc.department : 'All Departments',
        category: doc ? doc.category : 'Other',
        academicYear: doc ? doc.academicYear : '2026',
        pageNumber: r.pageNumber,
        chunkIndex: r.chunkIndex,
        text: r.text,
        score: parseFloat(r.score.toFixed(4))
      };
    })
    // Apply Metadata Filters if supplied
    .filter((item) => {
      if (options.department && options.department !== 'All' && options.department !== 'All Departments') {
        if (item.department !== options.department) return false;
      }
      if (options.category && options.category !== 'All') {
        if (item.category !== options.category) return false;
      }
      if (options.academicYear && options.academicYear !== 'All') {
        if (item.academicYear !== options.academicYear) return false;
      }
      // Apply Minimum Relevance Score Filter
      return item.score >= minScore;
    })
    .slice(0, limit);

  console.log(`[VECTOR SEARCH] Number of results: ${enrichedResults.length}`);

  enrichedResults.forEach((r, idx) => {
    console.log(`Result #${idx + 1}`);
    console.log(`  Score: ${r.score} (${(r.score * 100).toFixed(1)}%)`);
    console.log(`  Document: ${r.documentTitle} (${r.originalFileName})`);
    console.log(`  Page: ${r.pageNumber}`);
    console.log(`  Chunk: ${r.chunkIndex} (ID: ${r.id})`);
    console.log(`  Text preview: ${r.text.slice(0, 120).replace(/\n/g, ' ')}...`);
  });

  console.log(`[VECTOR SEARCH] Search completed`);
  return enrichedResults;
};
